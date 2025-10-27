import PWABadge from "./PWABadge.tsx";
import "./App.css";
import Map, { Layer, Source } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState } from "react";
import { useBluetooth } from "./contexts/BluetoothContext.tsx";
import BaseLayout from "./layouts/BaseLayout.tsx";
import type { GpsPosition, NtripConfig } from "./types.ts";
import { NtripClient } from "./services/ntrip-client.ts";
import { NmeaParser } from "./services/nmea-parser.ts";
import type { CircleLayerSpecification } from "react-map-gl/mapbox";
import type { FeatureCollection, Point } from "geojson";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MAP_INITIAL_LATITUDE = 46.1591;
const MAP_INITIAL_LONGITUDE = -1.1517;

if (!MAPBOX_ACCESS_TOKEN) {
  console.error(
    "VITE_MAPBOX_ACCESS_TOKEN n'est pas défini dans le fichier .env"
  );
}

const App = () => {
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [mapCenterPosition, setMapCenterPosition] = useState<number[] | null>([
    MAP_INITIAL_LONGITUDE,
    MAP_INITIAL_LATITUDE,
  ]);

  const {
    bluetoothConnected,
    connectBluetooth,
    disconnectBluetooth,
    subscribeBluetoothData,
    bluetoothService,
  } = useBluetooth();

  const [position, setPosition] = useState<GpsPosition | null>(null);
  const [ntripClient] = useState(() => new NtripClient());
  const [ntripConnected, setNtripConnected] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  useEffect(() => {
    if (!isRecording) return;

    const handler = (chunk: string) => {
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
        setPosition(newPosition);

        // Envoyer la position au client NTRIP si connecté
        if (ntripClient.isConnected()) {
          ntripClient.updateGpsPosition(newPosition);
        }
      }
    };
    const unsubscribe = subscribeBluetoothData(handler);
    return () => {
      unsubscribe();
    };
  }, [isRecording, subscribeBluetoothData]);

  // Handle NTRIP connection
  const handleNtripConnect = async (
    config: NtripConfig | undefined = {
      host: "crtk.net",
      port: 2101,
      mountpoint: "NEAR",
      username: "", // optionnel;
      password: "", // optionnel;
      sendGpsToServer: true,
      wsUrl: "wss://ws-tcp-ntrip-client.natuition.com",
    }
  ) => {
    try {
      // Pour le mountpoint NEAR, s'assurer qu'on a une position GPS
      if (config.mountpoint.toUpperCase() === "NEAR" && !position) {
        alert(
          "Position GPS requise pour le mountpoint NEAR. Veuillez attendre que votre position soit détectée."
        );
        return;
      }

      // Définir la position initiale si disponible
      if (position) {
        ntripClient.setInitialPosition(position);
      }

      await ntripClient.connect(config);
      setNtripConnected(true);

      // Forward RTCM data to Bluetooth device
      ntripClient.onData(async (data) => {
        if (bluetoothConnected) {
          try {
            await bluetoothService.write(data);
          } catch (error) {
            console.error("Failed to forward RTCM data:", error);
          }
        }
      });

      // Afficher un message informatif pour NEAR
      if (config.mountpoint.toUpperCase() === "NEAR") {
        console.log(
          "Connecté avec mountpoint NEAR - sélection automatique de la station la plus proche"
        );
      }
    } catch (error) {
      console.error("NTRIP connection failed:", error);
      alert(
        "Failed to connect to NTRIP caster. Please check your configuration."
      );
    }
  };

  // Handle NTRIP disconnection
  const handleNtripDisconnect = () => {
    ntripClient.disconnect();
    setNtripConnected(false);
  };

  // Créer les données GeoJSON pour la position actuelle
  const currentLocationGeoJSON: FeatureCollection<Point> = {
    type: "FeatureCollection",
    features: position
      ? [
          {
            type: "Feature",
            properties: { current: true },
            geometry: {
              type: "Point",
              coordinates: [position.longitude, position.latitude],
            },
          },
        ]
      : [],
  };

  const layerSpecifications: CircleLayerSpecification = {
    id: "current-location",
    type: "circle",
    paint: {
      "circle-color": "#b31fc7",
      "circle-opacity": 0.8,
      "circle-radius": 8,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 3,
    },
    source: "current-location",
  };

  return (
    <BaseLayout>
      <div className="map-container">
        {mapCenterPosition && (
          <h1 id="position">{`Lat: ${mapCenterPosition[1]} , Long: ${mapCenterPosition[0]}`}</h1>
        )}
        <Map
          id="map"
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          initialViewState={{
            longitude: MAP_INITIAL_LONGITUDE,
            latitude: MAP_INITIAL_LATITUDE,
            zoom: 10,
          }}
          mapStyle="mapbox://styles/vincentlb/cmfwcr7jb008101sc99fk3cfo"
          attributionControl={false}
          onLoad={() => setIsMapLoaded(true)}
          onMove={(evt) => {
            setMapCenterPosition([
              Number(evt.viewState.longitude.toFixed(4)),
              Number(evt.viewState.latitude.toFixed(4)),
            ]);
          }}
        >
          {isMapLoaded && (
            <>
              <header className="header">
                <h1>NavX</h1>
                <div className="header-buttons">
                  <button
                    onClick={
                      bluetoothConnected
                        ? disconnectBluetooth
                        : connectBluetooth
                    }
                    style={{
                      backgroundColor: bluetoothConnected
                        ? "#dc3545"
                        : "#007bff",
                    }}
                  >
                    {bluetoothConnected ? "Disconnect BLE" : "Connect BLE"}
                  </button>
                  <button
                    onClick={
                      ntripConnected
                        ? handleNtripDisconnect
                        : () => handleNtripConnect()
                    }
                    style={{
                      backgroundColor: !bluetoothConnected
                        ? "#ccc"
                        : ntripConnected
                        ? "#dc3545"
                        : "#007bff",
                      cursor: !bluetoothConnected ? "not-allowed" : "pointer",
                    }}
                    disabled={!bluetoothConnected}
                  >
                    {ntripConnected ? "Disconnect NTRIP" : "Connect NTRIP"}
                  </button>
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    style={{
                      backgroundColor: isRecording ? "#dc3545" : "#28a745",
                    }}
                  >
                    {isRecording ? "Stop Recording" : "Start Recording"}
                  </button>
                </div>
              </header>
              <Source
                id="current-location"
                type="geojson"
                data={currentLocationGeoJSON}
              >
                <Layer {...layerSpecifications} />
              </Source>
            </>
          )}
        </Map>

        <PWABadge />
      </div>
    </BaseLayout>
  );
};

export default App;
