import type { FeatureCollection, Point, Position } from "geojson";
import { Layer, Source } from "react-map-gl/mapbox";
import type { CircleLayerSpecification } from "react-map-gl/mapbox";

const CurrentPosition = ({ position }: { position: Position | null }) => {
  console.debug("___Render: CurrentPosition", position);

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
              coordinates: position,
            },
          },
        ]
      : [],
  };

  const layerSpecifications: CircleLayerSpecification = {
    id: "current-position",
    type: "circle",
    paint: {
      "circle-color": "#2a5ebe",
      "circle-opacity": 0.8,
      "circle-radius": 8,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 3,
    },
    source: "current-position",
  };

  return (
    <Source id="current-position" type="geojson" data={currentPositionGeoJSON}>
      <Layer {...layerSpecifications} />
    </Source>
  );
};

export default CurrentPosition;
