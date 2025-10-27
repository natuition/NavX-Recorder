import type { FeatureCollection, Point } from "geojson";
import { Layer, Source, useMap } from "react-map-gl/mapbox";
import type { CircleLayerSpecification } from "react-map-gl/mapbox";
import { useNavigatorGeolocation } from "../hooks/useNavigatorGeolocation";
import { useCallback, useEffect } from "react";
import { IoMdLocate } from "react-icons/io";
import { useLocation } from "../contexts/LocationContext";

const CurrentLocation = () => {
  console.debug("Render CurrentLocation");
  // const { currentLocation, initialLocation } = useNavigatorGeolocation();
  const { position, initialPosition } = useLocation().state;
  const { current: map } = useMap();

  // Centrer la carte sur la position initiale quand elle est obtenue
  // Via le hook useNavigatorGeolocation
  // useEffect(() => {
  //   if (!map) return;
  //   if (initialLocation) {
  //     map.flyTo({
  //       center: [initialLocation[0], initialLocation[1]],
  //       zoom: 14,
  //       speed: 1.2,
  //     });
  //   }
  // }, [initialLocation, map]);

  // Via le contexte LocationContext
  useEffect(() => {
    if (!map) return;
    if (initialPosition) {
      map.flyTo({
        center: [initialPosition.longitude, initialPosition.latitude],
        zoom: 14,
        speed: 1.2,
      });
    }
  }, [initialPosition, map]);

  const handleGeolocateClick = useCallback(() => {
    if (!map) return;
    if (position) {
      map.flyTo({
        center: [position.longitude, position.latitude],
        zoom: 14,
        speed: 1.2,
      });
    }
  }, [map, position]);

  // Créer les données GeoJSON pour la position actuelle
  const currentLocationGeoJSON: FeatureCollection<Point> = {
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
    <>
      <div id="geolocate" onClick={handleGeolocateClick}>
        <IoMdLocate size={24} />
      </div>
      <Source
        id="current-location"
        type="geojson"
        data={currentLocationGeoJSON}
      >
        <Layer {...layerSpecifications} />
      </Source>
    </>
  );
};

export default CurrentLocation;
