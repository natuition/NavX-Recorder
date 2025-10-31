import { useState } from "react";
import {
  Layer,
  Source,
  type LineLayerSpecification,
  type CircleLayerSpecification,
} from "react-map-gl/mapbox";
import type { FeatureCollection, LineString, Point } from "geojson";
import DistanceToolBar from "../components/DistanceToolBar";
import { Distance as DistanceTool } from "../utils/Distance";
import { useGeolocation } from "../contexts/GeolocationContext";

type GPSPoint = [number, number]; // [longitude, latitude]

const Distance = () => {
  const [gpsPoints, setGpsPoints] = useState<GPSPoint[]>([]);
  const [distances, setDistances] = useState<number[]>([]);

  const { position } = useGeolocation();

  const totalDistance = () => {
    return distances.reduce((prev, current) => prev + current, 0);
  };

  const handleAddGPSPoint = () => {
    if (!position) return;

    const newPoint: GPSPoint = [position.longitude, position.latitude];

    if (gpsPoints.length > 0) {
      const lastPoint = gpsPoints[gpsPoints.length - 1];

      const newDistance = DistanceTool.haversine(
        lastPoint[1],
        lastPoint[0],
        newPoint[1],
        newPoint[0]
      );
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
        distance={totalDistance()}
        onAdd={handleAddGPSPoint}
        onRemoveLast={() => setGpsPoints((prev) => prev.slice(0, -1))}
        onClearAll={() => setGpsPoints([])}
        onSave={() => console.log("Saving distance...")}
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

// const Distance = () => {
//   return (
//     <MapLayout>
//       <DistanceContent />
//     </MapLayout>
//   );
// };

export default Distance;
