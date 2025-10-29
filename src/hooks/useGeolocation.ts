import { useEffect, useRef, useState } from "react"
import { useBluetooth } from "../contexts/BluetoothContext";
import { NmeaParser } from "../services/nmea-parser";
import type { PositionGPS } from "../utils/types";

export const useGeolocation = () => {
  const [position, setPosition] = useState<PositionGPS | undefined>(undefined)

  const { bluetoothConnected, subscribeBluetoothData } =
    useBluetooth();

  useEffect(() => {
    if (!bluetoothConnected) return;

    let lastUpdate = Date.now();

    const handler = (chunk: string) => {
      const now = Date.now()
      if (now - lastUpdate < 500) return;
      lastUpdate = now;

      const parsed = NmeaParser.parse(chunk);

      if (parsed) {
        const GGA = parsed.find((p) => p.type === "GGA");

        // Traitements pour filtrer les trames (à améliorer)
        if (GGA?.latitude === undefined || GGA?.longitude === undefined) return;

        const newPosition: PositionGPS = {
          latitude: GGA.latitude,
          longitude: GGA.longitude,
          altitude: GGA.altitude,
          numSatellites: GGA.numSatellites,
          fixQuality: GGA.fixQuality,
          hdop: GGA.hdop,
        }

        setPosition(newPosition)
      }
    };
    const unsubscribe = subscribeBluetoothData(handler);
    return () => {
      unsubscribe();
    };
  }, [bluetoothConnected]);

  return position;
}
