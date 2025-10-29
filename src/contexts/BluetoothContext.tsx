import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { BluetoothService } from "../services/bluetooth";

type BluetoothContextValue = {
  bluetoothService: BluetoothService;
  bluetoothConnected: boolean;
  connectBluetooth: () => Promise<void>;
  disconnectBluetooth: () => Promise<void>;
  subscribeBluetoothData: (callback: (chunk: string) => void) => () => void;
};

const BluetoothContext = createContext<BluetoothContextValue | undefined>(
  undefined
);

export function BluetoothProvider({ children }: { children: ReactNode }) {
  const [bluetoothService] = useState(() => new BluetoothService());
  const [bluetoothConnected, setBluetoothConnected] = useState(false);

  // Gestion des abonnés aux données Bluetooth
  const listenersRef = useRef(new Set<(chunk: string) => void>());

  const subscribeBluetoothData = useCallback(
    (callback: (chunk: string) => void) => {
      listenersRef.current.add(callback);
      return () => {
        listenersRef.current.delete(callback);
      };
    },
    []
  );

  useEffect(() => {
    let mounted = true;

    const dispatchData = (chunk: string) => {
      if (!mounted) return;
      for (const cb of Array.from(listenersRef.current)) {
        try {
          cb(chunk);
        } catch (err) {
          console.error("Bluetooth listener error", err);
        }
      }
    };

    try {
      bluetoothService.onData(dispatchData);
    } catch (err) {
      console.error("Failed to attach bluetooth onData wrapper:", err);
    }

    return () => {
      mounted = false;

      // vider nos listeners pour éviter fuite mémoire
      listenersRef.current.clear();

      if (bluetoothConnected) {
        console.warn(
          "BluetoothProvider unmounting while still connected. Disconnecting..."
        );
        bluetoothService.disconnect().catch(() => {});
      }
    };
  }, []);

  const connectBluetooth = useCallback(async () => {
    try {
      await bluetoothService.connect();
      setBluetoothConnected(true);
    } catch (error) {
      console.error("Bluetooth connection failed:", error);
      // laisser le composant consommateur afficher UI/erreur si nécessaire
      throw error;
    }
  }, [bluetoothService]);

  const disconnectBluetooth = useCallback(async () => {
    try {
      await bluetoothService.disconnect();
      setBluetoothConnected(false);
    } catch (error) {
      console.error("Bluetooth disconnection failed:", error);
    }
  }, [bluetoothService]);

  const value: BluetoothContextValue = {
    bluetoothService,
    bluetoothConnected,
    connectBluetooth,
    disconnectBluetooth,
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
