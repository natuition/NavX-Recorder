import PWABadge from "./PWABadge.tsx";
import "./App.css";
import Map, { Layer, Source, type ViewState } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { FeatureCollection, Polygon, LineString, Point } from "geojson";
import type {
  FillLayerSpecification,
  LineLayerSpecification,
  CircleLayerSpecification,
} from "mapbox-gl";
import { useState, useCallback, useEffect } from "react";
import { useNavigatorGeolocation } from "./hooks/useNavigatorGeolocation.ts";
import { BluetoothService } from "./services/bluetooth.ts";
import { NmeaParser } from "./services/nmea-parser.ts";

type GPSPoint = [number, number]; // [longitude, latitude]

type GpsPosition = {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: Date;
};

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

if (!MAPBOX_ACCESS_TOKEN) {
  console.error(
    "VITE_MAPBOX_ACCESS_TOKEN n'est pas défini dans le fichier .env"
  );
}

function App() {
  const [bluetoothService] = useState(() => new BluetoothService());
  const [nmeaParser] = useState(() => new NmeaParser());

  const [nmeaBuffer, setNmeaBuffer] = useState<string>("");
  const [bleConnected, setBleConnected] = useState<boolean>(false);
  const [position, setPosition] = useState<GpsPosition | null>(null);

  // Process incoming NMEA data
  const processNmeaData = useCallback((data: string) => {
    const newBuffer = nmeaBuffer + data;
    const lines = newBuffer.split("\n");

    // Keep the last incomplete line in the buffer
    setNmeaBuffer(lines[lines.length - 1]);

    // Process complete lines
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (line.startsWith("$")) {
        const parsed = nmeaParser.parse(line);

        if (parsed) {
          // Update position
          if (parsed.latitude !== undefined && parsed.longitude !== undefined) {
            const newPosition = {
              latitude: parsed.latitude,
              longitude: parsed.longitude,
              altitude: parsed.altitude,
              timestamp: new Date(),
            };
            setPosition(newPosition);

            // Envoyer la position au client NTRIP si connecté
            // if (ntripClient.isConnected()) {
            //   ntripClient.updateGpsPosition(newPosition);
            // }
          }

          // Update fix quality
          // if (parsed.fixQuality !== undefined) {
          //   setFixType(parsed.fixQuality as FixType);
          // }

          // Update satellite count and HDOP
          // if (parsed.numSatellites !== undefined) {
          //   setNumSatellites(parsed.numSatellites);
          // }

          // if (parsed.hdop !== undefined) {
          //   setHdop(parsed.hdop);
          // }
        }
      }
    }
  }, []);

  // Handle Bluetooth connection
  const handleBleConnect = async () => {
    try {
      await bluetoothService.connect();
      setBleConnected(true);

      bluetoothService.onData((data) => {
        processNmeaData(data);
      });
    } catch (error) {
      console.error("Bluetooth connection failed:", error);
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to connect to Bluetooth device. Make sure the device is paired and in range.";
      alert(msg);
    }
  };

  // Handle Bluetooth disconnection
  const handleBleDisconnect = async () => {
    try {
      await bluetoothService.disconnect();
      setBleConnected(false);
    } catch (error) {
      console.error("Bluetooth disconnection failed:", error);
    }
  };

  const [mapLoaded, setMapLoaded] = useState(false);
  const [gpsPoints, setGpsPoints] = useState<GPSPoint[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const { currentLocation } = useNavigatorGeolocation();

  const [mapViewState, setMapViewState] = useState<ViewState>({
    longitude: -1.1517,
    latitude: 46.1591,
    zoom: 12,
    bearing: 0,
    elevation: 0,
    pitch: 0,
    padding: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  });

  // Centrer la carte sur la position actuelle quand elle est obtenue
  useEffect(() => {
    if (currentLocation) {
      setMapViewState((prev) => ({
        ...prev,
        zoom: 16,
        longitude: currentLocation[0],
        latitude: currentLocation[1],
      }));
    }
  }, [currentLocation]);

  const handleMapLoaded = useCallback(() => {
    setMapLoaded(true);
  }, []);

  const handleCreateNewReport = () => {
    console.log("Création d'un nouveau relevé GPS");
    setIsRecording((prev) => !prev);
    setGpsPoints([]);
  };

  // Créer les données GeoJSON pour la position actuelle
  const currentLocationGeoJSON: FeatureCollection<Point> = {
    type: "FeatureCollection",
    features: currentLocation
      ? [
          {
            type: "Feature",
            properties: { current: true },
            geometry: {
              type: "Point",
              coordinates: currentLocation,
            },
          },
        ]
      : [],
  };

  // Créer les données GeoJSON pour les points GPS
  const gpsPointsGeoJSON: FeatureCollection<Point> = {
    type: "FeatureCollection",
    features: gpsPoints.map((point, index) => ({
      type: "Feature",
      properties: { index },
      geometry: {
        type: "Point",
        coordinates: point,
      },
    })),
  };

  // Créer la ligne reliant les points
  const gpsLineGeoJSON: FeatureCollection<LineString> = {
    type: "FeatureCollection",
    features:
      gpsPoints.length > 1
        ? [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: gpsPoints,
              },
            },
          ]
        : [],
  };

  // Créer le polygone si fermé
  const gpsPolygonGeoJSON: FeatureCollection<Polygon> = {
    type: "FeatureCollection",
    features:
      gpsPoints.length > 3 &&
      gpsPoints[0][0] === gpsPoints[gpsPoints.length - 1][0] &&
      gpsPoints[0][1] === gpsPoints[gpsPoints.length - 1][1]
        ? [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Polygon",
                coordinates: [gpsPoints],
              },
            },
          ]
        : [],
  };

  const gpsLineLayer: LineLayerSpecification = {
    id: "gps-line",
    type: "line",
    paint: {
      "line-color": "#005eff",
      "line-width": 3,
      "line-dasharray": [2, 2],
    },
    source: "gps-line",
  };

  const gpsPointsLayer: CircleLayerSpecification = {
    id: "gps-points",
    type: "circle",
    paint: {
      "circle-color": "#005eff",
      "circle-radius": 6,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 2,
    },
    source: "gps-points",
  };

  const currentLocationLayer: CircleLayerSpecification = {
    id: "current-location",
    type: "circle",
    paint: {
      "circle-color": "#2a5ebe",
      "circle-opacity": 0.8,
      "circle-radius": 12,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 3,
    },
    source: "current-location",
  };

  const gpsPolygonLayer: FillLayerSpecification = {
    id: "gps-polygon",
    type: "fill",
    paint: {
      "fill-color": "#005eff",
      "fill-opacity": 0.3,
    },
    source: "gps-polygon",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100svh",
        width: "100svw",
        position: "relative",
      }}
    >
      <Map
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        initialViewState={{
          longitude: currentLocation?.[0] || -1.1517,
          latitude: currentLocation?.[1] || 46.1591,
          zoom: 12,
        }}
        viewState={mapViewState}
        mapStyle="mapbox://styles/vincentlb/cmfwcr7jb008101sc99fk3cfo"
        attributionControl={false}
        onLoad={handleMapLoaded}
        onMove={(evt) => {
          setMapViewState(evt.viewState);
        }}
        style={{
          border: `6px solid ${isRecording ? "red" : "transparent"}`,
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        {mapLoaded && (
          <>
            <header className="header">
              <h1>NavX</h1>
              <div className="header-buttons">
                <button
                  onClick={
                    bleConnected ? handleBleDisconnect : handleBleConnect
                  }
                  style={{
                    backgroundColor: bleConnected ? "#dc3545" : "#007bff",
                  }}
                >
                  {bleConnected ? "Disconnect BLE" : "Connect BLE"}
                </button>
              </div>
            </header>
            <Source
              id="current-location"
              type="geojson"
              data={currentLocationGeoJSON}
            >
              <Layer {...currentLocationLayer} />
            </Source>

            <Source id="gps-points" type="geojson" data={gpsPointsGeoJSON}>
              <Layer {...gpsPointsLayer} />
            </Source>

            <Source id="gps-line" type="geojson" data={gpsLineGeoJSON}>
              <Layer {...gpsLineLayer} />
            </Source>

            <Source id="gps-polygon" type="geojson" data={gpsPolygonGeoJSON}>
              <Layer {...gpsPolygonLayer} />
            </Source>

            <button onClick={handleCreateNewReport} className="btn btn--medium">
              {isRecording ? "⏹ Arrêter" : "📍 Créer un relevé"}
            </button>
          </>
        )}
      </Map>

      <PWABadge />
    </div>
  );
}

export default App;
