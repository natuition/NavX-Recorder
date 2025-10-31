import { useCallback, useEffect, useState } from "react";
import {
  Layer,
  Source,
  type LineLayerSpecification,
  type CircleLayerSpecification,
  type FillLayerSpecification,
} from "react-map-gl/mapbox";
import type { FeatureCollection, LineString, Point, Polygon } from "geojson";
import { useGeolocation } from "../contexts/GeolocationContext";
import SurfaceToolBar from "../components/SurfaceToolBar";
import { Distance } from "../utils/Distance";
import area from "@turf/area";

type LonLat = [number, number]; // [longitude, latitude]

const DISTANCE_THRESHOLD_METERS = 1; // Seuil de distance minimale entre deux points GPS
const UPDATE_INTERVAL_MILLISECONDS = 500; // Intervalle d'ajout de points GPS

const Surface = () => {
  const [gpsPoints, setGpsPoints] = useState<LonLat[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const { positionRef } = useGeolocation();

  const surfaceArea = useCallback(() => {
    // Calcul de la surface geodésique en mètre
    const polygon: Polygon = {
      type: "Polygon",
      coordinates: [[...gpsPoints, gpsPoints[0]]],
    };
    return area(polygon);
  }, [gpsPoints]);

  const handleSave = () => {
    console.log("Surface enregistrée ✅");
  };

  const handleSurfaceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setGpsPoints([]);
      setIsRecording(true);
    }
  };

  useEffect(() => {
    if (!isRecording) return;

    const intervalId = setInterval(() => {
      if (!positionRef.current) {
        console.warn("Position GPS non disponible");
        return;
      }

      const newPoint: LonLat = [
        positionRef.current.longitude,
        positionRef.current.latitude,
      ];

      setGpsPoints((prev) => {
        if (prev.length === 0) {
          return [newPoint];
        }

        const lastPoint = prev[prev.length - 1];
        const distance = Distance.equirectangular(
          lastPoint[1],
          lastPoint[0],
          newPoint[1],
          newPoint[0]
        );

        if (distance < DISTANCE_THRESHOLD_METERS) {
          return prev;
        }

        return [...prev, newPoint];
      });
    }, UPDATE_INTERVAL_MILLISECONDS);

    return () => {
      clearInterval(intervalId);
    };
  }, [isRecording]);

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
                coordinates: [...gpsPoints, gpsPoints[0]],
              },
            },
          ]
        : [],
  };

  const gpsPolygonGeoJSON: FeatureCollection<Polygon> = {
    type: "FeatureCollection",
    features:
      gpsPoints.length > 2
        ? [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Polygon",
                coordinates: [[...gpsPoints, gpsPoints[0]]],
              },
            },
          ]
        : [],
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
        <Layer {...gpsFillLayer} />
      </Source>
      <SurfaceToolBar
        surface={surfaceArea()}
        onSave={handleSave}
        unit="m²"
        onToggleRecording={handleSurfaceRecording}
        isRecording={isRecording}
      />
    </>
  );
};

const gpsFillLayer: FillLayerSpecification = {
  id: "gps-polygon",
  type: "fill",
  paint: {
    "fill-color": "#005eff",
    "fill-opacity": 0.25,
  },
  source: "gps-polygon",
};

const gpsLineLayer: LineLayerSpecification = {
  id: "gps-line",
  type: "line",
  paint: {
    "line-color": "#005eff",
    "line-width": 1,
    "line-dasharray": [1, 3],
  },
  source: "gps-line",
};

const gpsPointsLayer: CircleLayerSpecification = {
  id: "gps-points",
  type: "circle",
  paint: {
    "circle-color": "#005eff",
    "circle-radius": 3,
  },
  source: "gps-points",
};

export default Surface;
