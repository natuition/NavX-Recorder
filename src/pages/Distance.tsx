import { useEffect, useState } from "react";
import {
  Layer,
  Source,
  type LineLayerSpecification,
  type CircleLayerSpecification,
} from "react-map-gl/mapbox";
import type { FeatureCollection, LineString, Point } from "geojson";
import DistanceToolBar from "../components/DistanceToolBar";
import { Distance as DistanceTool } from "../utils/Distance";
import { useLocation } from "react-router";
import { useToast } from "../hooks/useToast";
import { useGeolocation } from "../hooks/useGeolocation";
import { useModal } from "../hooks/useModal";

type LonLat = [number, number]; // [longitude, latitude]

const Distance = () => {
  const location = useLocation();
  const toast = useToast();
  const modal = useModal();

  const [gpsPoints, setGpsPoints] = useState<LonLat[]>([]);
  const [distances, setDistances] = useState<number[]>([]);

  useEffect(() => {
    if (gpsPoints.length > 0) {
      location.state.measureActive = true;
    } else {
      location.state.measureActive = false;
    }
  }, [gpsPoints, location.state]);

  const { position } = useGeolocation();

  const totalDistance = () => {
    return distances.reduce((prev, current) => prev + current, 0);
  };

  const handleSave = () => {
    if (gpsPoints.length < 2) {
      console.warn("Add at least two GPS points to save the measurement.");
      return;
    }

    const newMeasurement = {
      id: crypto.randomUUID(),
      type: "distance",
      value: totalDistance(),
      unit: "m",
      points: gpsPoints,
    };

    modal.open({
      message: "Enregistrer cette mesure ?",
      yesLabel: true,
      noLabel: "Annuler",
      onNo: modal.close,
      onYes: () => {
        console.warn("Saving measurement:", newMeasurement);
        modal.close();
        setGpsPoints([]);
        setDistances([]);
        toast.success("Mesure enregistrée");
      },
    });
  };

  const handleAddGPSPointMock = () => {
    let newPoint: LonLat;
    if (gpsPoints.length === 0) {
      newPoint = [-1.1517, 46.1591];
    } else {
      const lastPoint = gpsPoints[gpsPoints.length - 1];
      newPoint = [
        lastPoint[0] + (Math.random() - 0.5) * 0.001,
        lastPoint[1] + (Math.random() - 0.5) * 0.001,
      ];
    }

    if (gpsPoints.length > 0) {
      const lastPoint = gpsPoints[gpsPoints.length - 1];

      const newDistance =
        DistanceTool.haversine(
          lastPoint[1],
          lastPoint[0],
          newPoint[1],
          newPoint[0]
        ) * 1000;

      setDistances((prev) => [...prev, newDistance]);
    }
    setGpsPoints((prev) => [...prev, newPoint]);
  };

  const handleAddGPSPoint = () => {
    if (!position) {
      console.warn("Position is not available, could not add GPS point.");
      toast.warn("Position GPS non disponible");
      return;
    }

    const newPoint: LonLat = [position.longitude, position.latitude];

    if (gpsPoints.length > 0) {
      const lastPoint = gpsPoints[gpsPoints.length - 1];

      const newDistance =
        // TODO: Utiliser turf.js pour le calcul de distance
        DistanceTool.haversine(
          lastPoint[1],
          lastPoint[0],
          newPoint[1],
          newPoint[0]
        ) * 1000; // TODO: configurable

      setDistances((prev) => [...prev, newDistance]);
    }
    setGpsPoints((prev) => [...prev, newPoint]);
  };

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
                coordinates: gpsPoints,
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
      <DistanceToolBar
        nbPoints={gpsPoints.length}
        distance={totalDistance()}
        onAdd={handleAddGPSPointMock}
        onRemoveLast={() => setGpsPoints((prev) => prev.slice(0, -1))}
        onSave={handleSave}
      />
    </>
  );
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
    "circle-color": "#2dbf80",
    "circle-radius": 5,
  },
  source: "gps-points",
};

export default Distance;
