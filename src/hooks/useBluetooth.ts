import { useContext } from "react";
import type { BluetoothContextType } from "../providers/BluetoothProvider";
import BluetoothContext from "../providers/BluetoothProvider";

// Hook personnalisé pour utiliser le contexte Bluetooth
export function useBluetooth(): BluetoothContextType {
  const ctx = useContext(BluetoothContext);
  if (!ctx) {
    throw new Error("useBluetooth must be used within BluetoothProvider");
  }
  return ctx;
}
