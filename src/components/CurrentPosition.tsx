import type { FeatureCollection, Point } from "geojson";
import { Layer, Source } from "react-map-gl/mapbox";
import type { CircleLayerSpecification } from "react-map-gl/mapbox";
import { useBluetooth } from "../contexts/BluetoothContext";
import { useCallback, useState } from "react";
import { NmeaParser } from "../services/nmea-parser";

type GPSPoint = [number, number]; // [longitude, latitude]

type GpsPosition = {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  timestamp: Date;
};

const CurrentPosition = ({}) => {
  const [nmeaParser] = useState(() => new NmeaParser());
  const [nmeaBuffer, setNmeaBuffer] = useState<string>("");
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

            console.log(newPosition);
            setPosition(newPosition);
          }
        }
      }
    }
  }, []);

  // Créer les données GeoJSON pour la position actuelle
  const currentPositionGeoJSON: FeatureCollection<Point> = {
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

  const layer: CircleLayerSpecification = {
    id: "current-position",
    type: "circle",
    paint: {
      "circle-color": "#2a5ebe",
      "circle-opacity": 0.8,
      "circle-radius": 12,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 3,
    },
    source: "current-position",
  };
  return (
    <Source id="current-position" type="geojson" data={currentPositionGeoJSON}>
      <Layer {...layer} />
    </Source>
  );
};

export default CurrentPosition;
