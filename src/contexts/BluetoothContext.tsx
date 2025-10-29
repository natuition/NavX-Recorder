import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useRef,
} from "react";

import { BleClient, type BleDevice } from "@capacitor-community/bluetooth-le";

// UART Service UUID (Nordic UART Service)
const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_RX_CHAR_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const UART_TX_CHAR_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";

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
  // Gestion des abonnés aux données Bluetooth
  const listenersRef = useRef(new Set<(chunk: string) => void>());
  const isWritingRef = useRef<boolean>(false);
  const writeQueueRef = useRef<ArrayBuffer[]>([]);

  const writeBluetoothData = async (data: ArrayBuffer) => {
    if (!bluetoothConnected || !deviceRef.current) {
      console.warn("Bluetooth is not connected. Cannot write data.");
      return;
    }
    // Enqueue the data to be written
    writeQueueRef.current.push(data);

    // Process the write queue
    if (!isWritingRef.current) {
      _processWriteQueue();
    }
  };

  const _processWriteQueue = async () => {
    if (isWritingRef.current) return;
    isWritingRef.current = true;

    try {
      while (writeQueueRef.current.length > 0 && bluetoothConnected) {
        const buf = writeQueueRef.current.shift();
        await _writeDataChunked(buf!);
      }
    } catch (error) {
      console.error("Error writing Bluetooth data:", error);
    } finally {
      isWritingRef.current = false;
      if (writeQueueRef.current.length > 0 && bluetoothConnected) {
        _processWriteQueue();
      }
    }
  };

  const _writeDataChunked = async (data: ArrayBuffer): Promise<void> => {
    const CHUNK_SIZE = 20;
    const DELAY = 8;

    const dataArray = new Uint8Array(data);

    for (let i = 0; i < dataArray.length; i += CHUNK_SIZE) {
      if (!bluetoothConnected) {
        console.warn(
          "Bluetooth disconnected during write. Aborting chunked write."
        );
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
  };

  const _writeWithRetry = async (
    view: DataView,
    maxRetries = 5
  ): Promise<void> => {
    if (!deviceRef.current || !bluetoothConnected) {
      console.warn("No Bluetooth device connected for write.");
      return;
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
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
        const msg = String(error.message || error || "");
        if (
          attempt < maxRetries &&
          /GATT operation already in progress/i.test(msg)
        ) {
          // Petit backoff exponentiel: 12ms, 20ms, 35ms, 60ms, 80ms...
          const delay = 12 + Math.floor(8 * Math.pow(1.6, attempt));
          await sleep(delay);
          continue;
        }
        // Dernier essai ou autre erreur: rethrow
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
    // Decode the incoming data
    const buffer = value.buffer.slice(
      value.byteOffset,
      value.byteOffset + value.byteLength
    );
    const decoder = new TextDecoder("utf-8");
    const text = decoder.decode(new Uint8Array(buffer));

    // Dispatch to subscribers
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
        writeQueueRef.current = [];
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
      console.info("Bluetooth disconnected");
    } catch (error) {
      console.error("Bluetooth disconnection error:", error);
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
