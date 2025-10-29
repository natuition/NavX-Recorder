import { useEffect, useRef, useState } from "react"
import { useBluetooth } from "../contexts/BluetoothContext";
import { NmeaParser } from "../services/nmea-parser";
import type { Mountpoint, PositionGPS } from "../utils/types";
import { NtripClient } from "../utils/NtripClient";

const ONE_SECOND = 1000

export const useGeolocation = () => {
  const [position, setPosition] = useState<PositionGPS | undefined>(undefined)
  // const [currentMountpoint, setCurrentMountpoint] = useState<Mountpoint | undefined>(undefined)

  const ntripClientRef = useRef(new NtripClient());
  const unsubRtcmRef = useRef<(() => void) | null>(null);
  const positionRef = useRef<PositionGPS>(undefined)
  const mountpointRef = useRef<Mountpoint | null>(undefined);
  const intervalRef = useRef<number>(undefined)
  const timeoutRef = useRef<number>(undefined);

  const { bluetoothConnected, subscribeBluetoothData, writeBluetoothData } =
    useBluetooth();

  const findNearestMountpoint = async () => {
    if (positionRef.current === undefined) return;

    try {
      const sourcetable = await NtripClient.fetchSourceTableWithProxy({
        host: "crtk.net",
        port: 2101,
        username: "",
        password: "",
      });

      const mountpoints = sourcetable.findNearestMountpoints({
        latitude: positionRef.current.latitude,
        longitude: positionRef.current.longitude,
      });

      if (mountpoints.length === 0) {
        console.warn(
          "Aucun mountpoint trouvé pour la position actuelle dans un rayon de 50kms"
        );
        return;
      }

      const nearest = mountpoints[0];

      if (mountpointRef.current?.mountpoint !== nearest.mountpoint) {
        mountpointRef.current = nearest;
        console.info(
          `Mountpoint le plus proche mis à jour : ${nearest.mountpoint} (${nearest.distance?.toFixed(1)}km)`
        );
      }
    } catch (err) {
      console.error("Error fetching NTRIP sourcetable:", err);
    }
  };


  const streamRTCMFromMountpoint = async () => {
    try {
      console.info(`Starting to stream RTCM data from ${mountpointRef.current!.identifier} [${mountpointRef.current!.mountpoint}]`);

      // Désabonner l'ancien listener avant de se reconnecter
      if (unsubRtcmRef.current) {
        unsubRtcmRef.current();
        unsubRtcmRef.current = null;
      }

      // Réinitialiser la connexion WebSocket vers le proxy et streamer
      await ntripClientRef.current.streamMountpointData({
        host: "crtk.net",
        port: 2101,
        mountpoint: mountpointRef.current!.mountpoint,
        username: "",
        password: "",
      });

      // S'abonner aux paquets RTCM et les transférer au device Bluetooth
      unsubRtcmRef.current = ntripClientRef.current.onRTCMData(
        async (rtcmData: ArrayBuffer) => {
          try {
            // console.log(rtcmData)
            writeBluetoothData(rtcmData);
          } catch (err) {
            console.error("Failed to send RTCM to Bluetooth:", err);
          }
        }
      );

    } catch (err) {
      console.error("Error streaming NTRIP:", err);
    }
  };


  useEffect(() => {
    if (!bluetoothConnected) return;

    let lastUpdate = Date.now();

    const handler = (chunk: string) => {
      const now = Date.now()
      if (now - lastUpdate < 1000) return;
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

        // console.log(newPosition);

        setPosition(newPosition)
        positionRef.current = newPosition
      }
    };

    // Avoir la position dès que possible provenant du rover
    const unsubscribe = subscribeBluetoothData(handler);

    // Si on a déjà une position on tente une première fois
    if (positionRef.current !== undefined) {
      console.info('Finding nearest mountpoint from position obtained instantly:', positionRef.current)
      findNearestMountpoint();
    } else {
      console.info('Finding nearest mountpoint from position obtained after delay of 5 seconds')
      timeoutRef.current = setTimeout(findNearestMountpoint, 5 * ONE_SECOND);
    }

    // On retente ensuite toutes les 10 minutes
    intervalRef.current = setInterval(findNearestMountpoint, 10 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
      setPosition(undefined);
      mountpointRef.current = undefined;
    };
  }, [bluetoothConnected]);

  // Rediriger les données RTCM quand le mountpoint change
  useEffect(() => {
    if (mountpointRef.current === undefined || !bluetoothConnected) return;

    streamRTCMFromMountpoint();

    return () => {
      if (unsubRtcmRef.current) {
        unsubRtcmRef.current();
        unsubRtcmRef.current = null;
      }
      ntripClientRef.current.disconnect();
    };
  }, [mountpointRef.current, bluetoothConnected])


  return { position, positionRef: positionRef.current };
}
