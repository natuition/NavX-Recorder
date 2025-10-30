import { useState } from "react";
import { MapLayout } from "../layouts/MapLayout";
import {
  Layer,
  Source,
  type LineLayerSpecification,
  type CircleLayerSpecification,
} from "react-map-gl/mapbox";
import type { FeatureCollection, LineString, Point } from "geojson";
import DistanceToolBar from "../components/DistanceToolBar";
import { useNavigatorGeolocation } from "../hooks/useNavigatorGeolocation";
import { Distance as DistanceTool } from "../utils/Distance";

type GPSPoint = [number, number]; // [longitude, latitude]

const Distance = () => {
  const [gpsPoints, setGpsPoints] = useState<GPSPoint[]>([]);
  const [distances, setDistances] = useState<number[]>([]);

  const { currentLocation } = useNavigatorGeolocation();

  const totalDistance = () => {
    return distances.reduce((prev, current) => prev + current, 0);
  };

  const handleAddGPSPoint = () => {
    if (!currentLocation) return;

    const newPoint: GPSPoint = [currentLocation[0], currentLocation[1]];

    if (gpsPoints.length > 0) {
      const lastPoint = gpsPoints[gpsPoints.length - 1];

      const newDistance = DistanceTool.haversine(
        lastPoint[1],
        lastPoint[0],
        newPoint[1],
        newPoint[0]
      );

      console.debug("New distance: ", newDistance);

      setDistances((prev) => [...prev, newDistance]);

      console.debug("Distance total: ", totalDistance());
    }

    console.log("Nouveau point ajouté:", newPoint);
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

  return (
    <>
      <MapLayout>
        <Source id="gps-points" type="geojson" data={gpsPointsGeoJSON}>
          <Layer {...gpsPointsLayer} />
        </Source>
        <Source id="gps-line" type="geojson" data={gpsLineGeoJSON}>
          <Layer {...gpsLineLayer} />
        </Source>
        <DistanceToolBar onAdd={handleAddGPSPoint} />
      </MapLayout>
    </>
  );
};

export default Distance;
