import { useSearchParams } from "react-router";
import { useProjectManager } from "../hooks/useProjectManager";
import { useEffect, useState } from "react";
import { lineStrings, points } from "@turf/helpers";
import { center } from "@turf/center";
import {
  Layer,
  Source,
  useMap,
  type CircleLayerSpecification,
  type LineLayerSpecification,
} from "react-map-gl/mapbox";
import Loader from "../components/Loader";

const MapLayer = () => {
  const [search] = useSearchParams();
  const { map } = useMap();
  const projectManager = useProjectManager();

  const [isReady, setIsReady] = useState(false);
  const [gpsPointsGeoJSON, setGpsPointsGeoJSON] = useState<
    GeoJSON.FeatureCollection | undefined
  >();
  const [gpsLineGeoJSON, setGpsLineGeoJSON] = useState<
    GeoJSON.FeatureCollection | undefined
  >();

  useEffect(() => {
    const loadLayer = async () => {
      if (!map) return;

      const layerId = search.get("layer");
      const projectId = search.get("project");
      if (!layerId || !projectId) return;

      const project = await projectManager.getProject(projectId);
      if (!project) {
        return;
      }

      const measurement = project.measurements.find((m) => m.id === layerId);
      if (!measurement) {
        return;
      }

      const gpsPoints = measurement.points;
      const gpsLine = gpsPoints.length > 1 ? [gpsPoints] : [];

      const pts = points(gpsPoints);
      const line = lineStrings(gpsLine);

      setGpsPointsGeoJSON(pts);
      setGpsLineGeoJSON(line);

      const centerPoint = center(pts);
      const coords = centerPoint.geometry.coordinates as [number, number];

      map.flyTo({ center: coords, zoom: 19 });
    };

    loadLayer().then(() => setIsReady(true));
  }, [map, search, projectManager]);

  if (search.get("layer") === null || search.get("project") === null) {
    return null;
  }

  return isReady ? (
    <>
      <Source id="gps-line" type="geojson" data={gpsLineGeoJSON}>
        <Layer {...gpsLineLayer} />
      </Source>
      <Source id="gps-points" type="geojson" data={gpsPointsGeoJSON}>
        <Layer {...gpsPointsLayer} />
      </Source>
    </>
  ) : (
    <Loader />
  );
};

export default MapLayer;

const gpsLineLayer: LineLayerSpecification = {
  id: "gps-line",
  type: "line",
  paint: {
    "line-color": "#7f00ff",
    "line-width": 1.5,
    "line-opacity": 0.8,
  },
  source: "gps-line",
};

const gpsPointsLayer: CircleLayerSpecification = {
  id: "gps-points",
  type: "circle",
  paint: {
    "circle-color": "#7f00ff",
    "circle-blur": 0.25,
    "circle-radius": 5,
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 2,
  },
  source: "gps-points",
};
