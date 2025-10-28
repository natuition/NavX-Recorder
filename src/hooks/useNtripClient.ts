import { useCallback, useEffect, useState, useRef } from "react";
import { NtripClient } from "../utils/NtripClient";
import type { Mountpoint } from "../utils/types";
import { BluetoothLe } from "@capacitor-community/bluetooth-le";
import { useBluetooth } from "../contexts/BluetoothContext";


const useNtripClient = ({ latitude, longitude }: { latitude?: number, longitude?: number }) => {
  const [mountpoint, setMountpoint] =
    useState<Mountpoint | null>(null);

  const previousMountpointRef = useRef<string | null>(null);
  const ntripClientRef = useRef(new NtripClient());
  const unsubRtcmRef = useRef<(() => void) | null>(null);


  const { bluetoothConnected, bluetoothService } = useBluetooth()

  const findNearestMountpoint = useCallback(async () => {
    if (latitude === undefined || longitude === undefined) return;

    try {
      const sourcetable = await NtripClient.fetchSourceTableWithProxy({
        host: "crtk.net",
        port: 2101,
        username: "",
        password: "",
      });

      const mountpoints = sourcetable.findNearestMountpoints({
        latitude: latitude,
        longitude: longitude,
      });

      if (mountpoints.length === 0) {
        console.warn(
          "Aucun mountpoint trouvé pour la position actuelle dans un rayon de 50kms"
        );
        return;
      }

      const nearest = mountpoints[0];

      if (previousMountpointRef.current !== nearest.mountpoint) {
        console.info(
          `Mountpoint le plus proche mis à jour : ${nearest.mountpoint} (${nearest.distance?.toFixed(1)}km)`
        );
        setMountpoint(nearest);
        previousMountpointRef.current = nearest.mountpoint;
      }
    } catch (err) {
      console.error("Error fetching NTRIP sourcetable:", err);
    }
  }, [latitude, longitude]);


  useEffect(() => {
    // Appel immédiat
    findNearestMountpoint();

    // Puis toutes les 10s
    const interval = setInterval(findNearestMountpoint, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [findNearestMountpoint]);


  // Streamer les données RTCM quand le mountpoint change
  useEffect(() => {
    if (!mountpoint || !bluetoothConnected) return;

    const streamMountpoint = async () => {
      try {
        console.log(`Starting to stream from ${mountpoint.mountpoint}`);


        // Désabonner l'ancien listener avant de se reconnecter
        if (unsubRtcmRef.current) {
          unsubRtcmRef.current();
          unsubRtcmRef.current = null;
        }

        // Réinitialiser la connexion WebSocket vers le proxy et streamer
        await ntripClientRef.current.streamMountpointData({
          host: "crtk.net",
          port: 2101,
          mountpoint: mountpoint.mountpoint,
          username: "",
          password: "",
        });

        // S'abonner aux paquets RTCM et les transférer au device Bluetooth
        unsubRtcmRef.current = ntripClientRef.current.onRTCMData(
          async (rtcmData) => {
            try {
              if (bluetoothConnected && bluetoothService) {
                console.log("Sending RTCM to Bluetooth:", rtcmData);
                bluetoothService.write(rtcmData)
              }

            } catch (err) {
              console.error("Failed to send RTCM to Bluetooth:", err);
            }

          }
        );

        console.log(`✅ NTRIP stream active for ${mountpoint.mountpoint}`);
      } catch (err) {
        console.error("Error streaming NTRIP:", err);
      }
    };

    streamMountpoint();

    return () => {
      if (unsubRtcmRef.current) {
        unsubRtcmRef.current();
        unsubRtcmRef.current = null;
      }
      ntripClientRef.current.disconnect();
    };
  }, [mountpoint, bluetoothConnected, bluetoothService]);

  useEffect(() => {
    return () => {
      if (unsubRtcmRef.current) {
        unsubRtcmRef.current();
      }
      ntripClientRef.current.disconnect();
    };
  }, []);

  return {
    nearestMountpoint: mountpoint, disconnectNtrip: () => {
      // Désabonner le listener RTCM
      if (unsubRtcmRef.current) {
        unsubRtcmRef.current();
        unsubRtcmRef.current = null;
      }
      // Fermer la connexion NTRIP
      ntripClientRef.current.disconnect();
    }
  };
};

export default useNtripClient;
