import {
  createContext,
  useState,
  type ReactNode,
  useRef,
  useEffect,
} from "react";

import { BleClient, type BleDevice } from "@capacitor-community/bluetooth-le";

// UART Service UUID (Nordic UART Service)
const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_RX_CHAR_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const UART_TX_CHAR_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

// Configuration — ÉCRITURE À 1Hz EXACTEMENT
const BLE_WRITE_INTERVAL = 1000; // 1 seconde (1Hz)
const BLE_DISCONNECT_TIMEOUT = 2000; // 2 secondes
const BLE_STOP_NOTIFS_WARN_THRESHOLD = 5000; // 5 secondes

export type BluetoothContextType = {
  bluetoothConnected: boolean;
  connectBluetooth: () => Promise<void>;
  disconnectBluetooth: () => Promise<void>;
  writeBluetoothData: (data: ArrayBuffer) => void;
  subscribeBluetoothData: (callback: (chunk: string) => void) => () => void;
};

const BluetoothContext = createContext<BluetoothContextType | undefined>(
  undefined
);

export const BluetoothProvider = ({ children }: { children: ReactNode }) => {
  const [bluetoothConnected, setBluetoothConnected] = useState<boolean>(false);

  const deviceRef = useRef<BleDevice | null>(null);
  const listenersRef = useRef(new Set<(chunk: string) => void>());
  const isWritingRef = useRef<boolean>(false);
  const isDisconnectingRef = useRef<boolean>(false);

  // Buffer rotatif — garde seulement le dernier paquet RTCM reçu
  const latestRtcmPacketRef = useRef<ArrayBuffer | null>(null);
  const writeIntervalRef = useRef<number | null>(null);

  // Stats
  const writeStatsRef = useRef({ sent: 0, skipped: 0, errors: 0 });

  // Monitoring (optionnel)
  const lastNotificationRef = useRef<number>(Date.now());

  const writeBluetoothData = (data: ArrayBuffer) => {
    if (
      isDisconnectingRef.current ||
      !bluetoothConnected ||
      !deviceRef.current
    ) {
      return;
    }

    // Remplacer l'ancien paquet par le nouveau (garde toujours le plus récent)
    latestRtcmPacketRef.current = data;
  };

  // Intervalle qui envoie le paquet le plus récent toutes les 1 seconde
  useEffect(() => {
    if (!bluetoothConnected || isDisconnectingRef.current) {
      return;
    }

    writeIntervalRef.current = setInterval(() => {
      if (isDisconnectingRef.current || !bluetoothConnected) {
        return;
      }

      // Si on a un paquet à envoyer et qu'on n'est pas déjà en train d'écrire
      if (latestRtcmPacketRef.current && !isWritingRef.current) {
        const packetToSend = latestRtcmPacketRef.current;
        latestRtcmPacketRef.current = null; // Consommer le paquet

        _writeDataChunked(packetToSend);
      } else if (!latestRtcmPacketRef.current) {
        writeStatsRef.current.skipped++;
        console.debug("No new RTCM data to send (skipped)");
      } else {
        console.warn("Write still in progress, skipping this interval");
      }
    }, BLE_WRITE_INTERVAL);

    return () => {
      if (writeIntervalRef.current !== null) {
        clearInterval(writeIntervalRef.current);
        writeIntervalRef.current = null;
      }
    };
  }, [bluetoothConnected]);

  const _writeDataChunked = async (data: ArrayBuffer): Promise<void> => {
    if (isWritingRef.current || isDisconnectingRef.current) {
      return;
    }

    isWritingRef.current = true;

    try {
      const CHUNK_SIZE = 20;
      const DELAY = 5; // Délai entre chunks (5ms)

      const dataArray = new Uint8Array(data);

      for (let i = 0; i < dataArray.length; i += CHUNK_SIZE) {
        if (isDisconnectingRef.current || !bluetoothConnected) {
          console.warn("Write aborted: disconnecting");
          break;
        }

        const chunk = dataArray.slice(
          i,
          Math.min(i + CHUNK_SIZE, dataArray.length)
        );

        const view = new DataView(
          chunk.buffer,
          chunk.byteOffset,
          chunk.byteLength
        );

        await _writeWithRetry(view);

        if (i + CHUNK_SIZE < dataArray.length) await sleep(DELAY);
      }

      writeStatsRef.current.sent++;
    } catch (error: any) {
      if (!isDisconnectingRef.current) {
        console.error("Error writing Bluetooth data:", error.message);
        writeStatsRef.current.errors++;
      }
    } finally {
      isWritingRef.current = false;
    }
  };

  const _writeWithRetry = async (
    view: DataView,
    maxRetries = 3
  ): Promise<void> => {
    if (
      !deviceRef.current ||
      !bluetoothConnected ||
      isDisconnectingRef.current
    ) {
      return;
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (isDisconnectingRef.current) return;

      try {
        if (typeof BleClient.writeWithoutResponse === "function") {
          await BleClient.writeWithoutResponse(
            deviceRef.current!.deviceId,
            UART_SERVICE_UUID,
            UART_RX_CHAR_UUID,
            view
          );
        } else {
          await BleClient.write(
            deviceRef.current!.deviceId,
            UART_SERVICE_UUID,
            UART_RX_CHAR_UUID,
            view
          );
        }
        return; // success
      } catch (error: any) {
        if (isDisconnectingRef.current) return;

        const msg = String(error.message || error || "");
        if (
          attempt < maxRetries &&
          /GATT operation already in progress/i.test(msg)
        ) {
          const delay = 8 + Math.floor(5 * Math.pow(1.5, attempt));
          await sleep(delay);
          continue;
        }
        throw error;
      }
    }
  };

  const sleep = async (ms: number): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  };

  const subscribeBluetoothData = (
    callback: (data: string) => void
  ): (() => void) => {
    listenersRef.current.add(callback);
    return () => {
      listenersRef.current.delete(callback);
    };
  };

  const handleNotifications = (value: DataView): void => {
    lastNotificationRef.current = Date.now();

    const buffer = value.buffer.slice(
      value.byteOffset,
      value.byteOffset + value.byteLength
    );
    const decoder = new TextDecoder("utf-8");
    const text = decoder.decode(new Uint8Array(buffer));

    for (const cb of Array.from(listenersRef.current)) {
      try {
        cb(text);
      } catch (err) {
        console.error("Bluetooth listener error", err);
      }
    }
  };

  const connectBluetooth = async (): Promise<void> => {
    try {
      isDisconnectingRef.current = false;
      writeStatsRef.current = { sent: 0, skipped: 0, errors: 0 };

      console.debug("Bluetooth initializing connection...");
      await BleClient.initialize();
      console.debug("Bluetooth initialized");

      console.debug("Requesting Bluetooth device...");
      deviceRef.current = await BleClient.requestDevice({
        services: [UART_SERVICE_UUID],
      });
      console.debug(`Device selected: ${deviceRef.current.name}`);

      console.debug(`Connecting to ${deviceRef.current.name}...`);
      await BleClient.connect(deviceRef.current.deviceId, () => {
        console.debug(`${deviceRef.current?.name} disconnected`);
        setBluetoothConnected(false);
        deviceRef.current = null;
        isWritingRef.current = false;
        isDisconnectingRef.current = false;
        latestRtcmPacketRef.current = null;
        if (writeIntervalRef.current !== null) {
          clearInterval(writeIntervalRef.current);
          writeIntervalRef.current = null;
        }
      });
      console.debug(`Connected to ${deviceRef.current.name}`);

      setBluetoothConnected(true);

      console.debug("Starting notifications from Bluetooth device...");
      await BleClient.startNotifications(
        deviceRef.current.deviceId,
        UART_SERVICE_UUID,
        UART_TX_CHAR_UUID,
        handleNotifications
      );
      console.debug("Bluetooth notifications started");
      lastNotificationRef.current = Date.now();
    } catch (error: any) {
      if (error.message.includes("User cancelled")) {
        console.warn("Bluetooth connection cancelled by user");
      } else {
        console.error("Bluetooth connection error:", error);
      }
    }
  };

  const disconnectBluetooth = async (): Promise<void> => {
    if (!bluetoothConnected || !deviceRef.current) {
      console.warn("No Bluetooth device to disconnect");
      return;
    }

    try {
      isDisconnectingRef.current = true;

      // Arrêter l'intervalle d'écriture
      if (writeIntervalRef.current !== null) {
        clearInterval(writeIntervalRef.current);
        writeIntervalRef.current = null;
      }

      // Vider le buffer
      latestRtcmPacketRef.current = null;

      // Attendre que l'écriture en cours se termine
      console.debug("Waiting for ongoing write operations to finish...");
      const startWait = Date.now();
      while (
        isWritingRef.current &&
        Date.now() - startWait < BLE_DISCONNECT_TIMEOUT
      ) {
        await sleep(50);
      }
      console.debug("Write operations stopped");

      if (isWritingRef.current) {
        console.warn(
          "Force-stopping write operation (consider increasing BLUETOOTH_DISCONNECT_TIMEOUT)"
        );
        isWritingRef.current = false;
      }

      console.debug("Stopping Bluetooth notifications...");
      const notificationsStoppedAt = Date.now();
      await BleClient.stopNotifications(
        deviceRef.current.deviceId,
        UART_SERVICE_UUID,
        UART_TX_CHAR_UUID
      );

      if (
        Date.now() - notificationsStoppedAt >
        BLE_STOP_NOTIFS_WARN_THRESHOLD
      ) {
        console.warn(
          `Bluetooth notifications stop is taking too long consider reworking disconnection logic`
        );
      }

      console.debug("Bluetooth notifications stopped");

      console.debug(`Disconnecting ${deviceRef.current.name}...`);
      await BleClient.disconnect(deviceRef.current.deviceId);
      setBluetoothConnected(false);
      deviceRef.current = null;
      isDisconnectingRef.current = false;

      // Log stats finales
      console.debug(
        `Final stats: sent=${writeStatsRef.current.sent}, skipped=${writeStatsRef.current.skipped}, errors=${writeStatsRef.current.errors}`
      );
    } catch (error) {
      console.error("Bluetooth disconnection error:", error);
      isDisconnectingRef.current = false;
    }
  };

  const value: BluetoothContextType = {
    bluetoothConnected,
    connectBluetooth,
    disconnectBluetooth,
    writeBluetoothData,
    subscribeBluetoothData,
  };

  return (
    <BluetoothContext.Provider value={value}>
      {children}
    </BluetoothContext.Provider>
  );
};
export default BluetoothContext;
