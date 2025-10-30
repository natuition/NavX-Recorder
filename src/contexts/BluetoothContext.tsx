import {
  createContext,
  useContext,
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
const WRITE_INTERVAL = 1000; // 1 seconde (1Hz)

type BluetoothContextValue = {
  bluetoothConnected: boolean;
  connectBluetooth: () => Promise<void>;
  disconnectBluetooth: () => Promise<void>;
  writeBluetoothData: (data: ArrayBuffer) => void;
  subscribeBluetoothData: (callback: (chunk: string) => void) => () => void;
};

const BluetoothContext = createContext<BluetoothContextValue | undefined>(
  undefined
);

export function BluetoothProvider({ children }: { children: ReactNode }) {
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

    console.info("🔄 Starting 1Hz write interval...");

    writeIntervalRef.current = setInterval(() => {
      if (isDisconnectingRef.current || !bluetoothConnected) {
        return;
      }

      // Si on a un paquet à envoyer et qu'on n'est pas déjà en train d'écrire
      if (latestRtcmPacketRef.current && !isWritingRef.current) {
        const packetToSend = latestRtcmPacketRef.current;
        latestRtcmPacketRef.current = null; // Consommer le paquet

        console.debug(
          `📤 Sending latest RTCM packet (${packetToSend.byteLength} bytes)`
        );
        _writeDataChunked(packetToSend);
      } else if (!latestRtcmPacketRef.current) {
        writeStatsRef.current.skipped++;
        console.debug("⏭️ No new RTCM data to send (skipped)");
      } else {
        console.warn("⚠️ Write still in progress, skipping this interval");
      }
    }, WRITE_INTERVAL);

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

      console.info("Bluetooth initializing connection...");
      await BleClient.initialize();
      console.info("Bluetooth initialized");

      console.info("Requesting Bluetooth device...");
      deviceRef.current = await BleClient.requestDevice({
        services: [UART_SERVICE_UUID],
      });
      console.info(
        `Device selected: ${deviceRef.current.name} (${deviceRef.current.deviceId})`
      );

      console.info("Connecting to selected Bluetooth device...");
      await BleClient.connect(deviceRef.current.deviceId, (deviceId) => {
        console.log(`Device ${deviceId} disconnected`);
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
      console.info(
        `Connected to device ${deviceRef.current.name} (${deviceRef.current.deviceId})`
      );

      setBluetoothConnected(true);

      console.info("Starting notifications from Bluetooth device...");
      await BleClient.startNotifications(
        deviceRef.current.deviceId,
        UART_SERVICE_UUID,
        UART_TX_CHAR_UUID,
        handleNotifications
      );
      console.info("Bluetooth notifications started");
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
      console.info("🛑 Stopping all write operations...");
      isDisconnectingRef.current = true;

      // Arrêter l'intervalle d'écriture
      if (writeIntervalRef.current !== null) {
        clearInterval(writeIntervalRef.current);
        writeIntervalRef.current = null;
      }

      // Vider le buffer
      latestRtcmPacketRef.current = null;

      // Attendre que l'écriture en cours se termine (timeout 2s)
      const startWait = Date.now();
      while (isWritingRef.current && Date.now() - startWait < 2000) {
        await sleep(50);
      }

      if (isWritingRef.current) {
        console.warn("⚠️ Force-stopping write operation (timeout)");
        isWritingRef.current = false;
      }

      console.info("Stopping Bluetooth notifications...");
      await BleClient.stopNotifications(
        deviceRef.current.deviceId,
        UART_SERVICE_UUID,
        UART_TX_CHAR_UUID
      );
      console.info("Bluetooth notifications stopped");

      console.info("Disconnecting Bluetooth...");
      await BleClient.disconnect(deviceRef.current.deviceId);
      setBluetoothConnected(false);
      deviceRef.current = null;
      isDisconnectingRef.current = false;
      console.info("✅ Bluetooth disconnected");

      // Log stats finales
      console.info(
        `📊 Final stats: sent=${writeStatsRef.current.sent}, skipped=${writeStatsRef.current.skipped}, errors=${writeStatsRef.current.errors}`
      );
    } catch (error) {
      console.error("Bluetooth disconnection error:", error);
      isDisconnectingRef.current = false;
    }
  };

  const value: BluetoothContextValue = {
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
}

export function useBluetooth(): BluetoothContextValue {
  const ctx = useContext(BluetoothContext);
  if (!ctx) {
    throw new Error("useBluetooth must be used within BluetoothProvider");
  }
  return ctx;
}
