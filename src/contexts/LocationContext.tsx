import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useBluetooth } from "./BluetoothContext";
import { NmeaParser } from "../services/nmea-parser";
import type { GpsPosition, NtripConfig } from "../types";
import { NtripClient } from "../services/ntrip-client";

// Fix type enumeration selon standard NMEA GGA
enum QualityType {
  NO_FIX = 0, // Aucun fix
  GPS = 1, // GPS autonome (±1.5-3m H, ±3-5m V)
  DGPS = 2, // DGPS/SBAS (±0.3-1m H, ±0.5-2m V)
  PPS = 3, // PPS fix (non utilisé généralement)
  RTK_FIXED = 4, // RTK Fixed (±1-2cm H, ±2-4cm V)
  RTK_FLOAT = 5, // RTK Float (±5-20cm H, ±10-40cm V)
  DEAD_RECKONING = 6, // Dead Reckoning (estimation)
}

// GPS position data
interface GpsPosition {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: Date;
}

interface LocationState {
  initialPosition?: GpsPosition;
  position?: GpsPosition;
}

// Types pour les actions du contexte
interface LocationContextType {
  state: LocationState;
  // Actions
}

// State initial
const initialState: LocationState = {
  position: undefined,
  initialPosition: undefined,
};

// Création du contexte
const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<AppProviderProps> = ({ children }) => {
  console.debug("LocationProvider mounted");

  const [state, setState] = useState<LocationState>(initialState);
  const [ntripClient] = useState(() => new NtripClient());
  const [ntripConnected, setNtripConnected] = useState<boolean>(false);

  // TODO: const { ntripClient } = useNTRIP(); // ou passer l'instance NtripClient en prop
  const { bluetoothConnected, bluetoothService, subscribeBluetoothData } =
    useBluetooth();

  useEffect(() => {
    let lastRecordTime = Date.now();

    const handler = (chunk: string) => {
      if (Date.now() - lastRecordTime < 1000) return;

      lastRecordTime = Date.now();

      const parsed = NmeaParser.parse(chunk);

      if (parsed) {
        const GGA = parsed.find((p) => p.type === "GGA");
        console.log("Fix quality:", GGA?.fixQuality);

        if (GGA?.latitude === undefined || GGA?.longitude === undefined) return;

        const newPosition: GpsPosition = {
          latitude: GGA?.latitude,
          longitude: GGA?.longitude,
          altitude: GGA?.altitude,
          timestamp: new Date(),
        };

        console.log(newPosition);

        if (state.initialPosition === undefined) {
          setState((prev) => ({ ...prev, initialPosition: newPosition }));
        }

        setState((prev) => ({ ...prev, position: newPosition }));
        // Envoyer la position au client NTRIP si connecté
        // if (ntripClient.isConnected()) {
        //   ntripClient.updateGpsPosition(newPosition);
        // }
      }
    };
    const unsubscribe = subscribeBluetoothData(handler);
    return () => {
      unsubscribe();
    };
  }, [bluetoothConnected]);

  const value: LocationContextType = {
    state,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
