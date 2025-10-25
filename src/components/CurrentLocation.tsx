import type { FeatureCollection, Point } from "geojson";
import { Layer, Source, useMap } from "react-map-gl/mapbox";
import type { CircleLayerSpecification } from "react-map-gl/mapbox";
import { useNavigatorGeolocation } from "../hooks/useNavigatorGeolocation";
import { useEffect } from "react";

const CurrentLocation = () => {
  const { currentLocation, initialLocation } = useNavigatorGeolocation();
  const { current: map } = useMap();

  // Centrer la carte sur la position initiale quand elle est obtenue
  useEffect(() => {
    if (!map) return;
    if (initialLocation) {
      map.flyTo({
        center: [initialLocation[0], initialLocation[1]],
        zoom: 14,
        speed: 1.2,
      });
    }
  }, [initialLocation, map]);

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

  const layerSpecifications: CircleLayerSpecification = {
    id: "current-location",
    type: "circle",
    paint: {
      "circle-color": "#2a5ebe",
      "circle-opacity": 0.8,
      "circle-radius": 8,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 3,
    },
    source: "current-location",
  };

  return (
    <Source id="current-location" type="geojson" data={currentLocationGeoJSON}>
      <Layer {...layerSpecifications} />
    </Source>
  );
};

export default CurrentLocation;
