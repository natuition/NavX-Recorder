import { useEffect, useState } from "react";
import type { FeatureCollection, Polygon, LineString, Point } from "geojson";
import { Layer, Source } from "react-map-gl/mapbox";
import type {
  FillLayerSpecification,
  LineLayerSpecification,
  CircleLayerSpecification,
} from "mapbox-gl";
import { useBluetooth } from "../contexts/BluetoothContext";
import { NmeaParser } from "../services/nmea-parser";

type GPSPoint = [number, number]; // [longitude, latitude]

const ZoneGeometry = () => {
  const [gpsPoints, setGpsPoints] = useState<GPSPoint[]>([]);
  // Cette propstion devra être passée depuis le parent
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const { subscribeBluetoothData } = useBluetooth();

  useEffect(() => {
    if (!isRecording) return;

    const handler = (chunk: string) => {
      console.log(NmeaParser.parse(chunk));
      const parsed = NmeaParser.parse(chunk);
      if (
        parsed &&
        parsed.type === "GGA" &&
        parsed.latitude !== undefined &&
        parsed.longitude !== undefined
      ) {
        const newPoint: GPSPoint = [parsed.longitude, parsed.latitude];
        console.log("New GPS Point:", newPoint);
        setGpsPoints((prev) => [...prev, newPoint]);
      }
    };
    const unsubscribe = subscribeBluetoothData(handler);
    return () => {
      unsubscribe();
    };
  }, [isRecording, subscribeBluetoothData]);

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
    <>
      <Source id="gps-points" type="geojson" data={gpsPointsGeoJSON}>
        <Layer {...gpsPointsLayer} />
      </Source>

      <Source id="gps-line" type="geojson" data={gpsLineGeoJSON}>
        <Layer {...gpsLineLayer} />
      </Source>

      <Source id="gps-polygon" type="geojson" data={gpsPolygonGeoJSON}>
        <Layer {...gpsPolygonLayer} />
      </Source>

      {/* <button
        onClick={() => setIsRecording(!isRecording)}
        className="btn btn--medium"
      >
        {isRecording ? "⏹ Arrêter" : "📍 Créer un relevé"}
      </button> */}
    </>
  );
};

export default ZoneGeometry;
