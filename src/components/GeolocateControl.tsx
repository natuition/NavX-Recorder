import type { FeatureCollection, Point } from "geojson";
import { Layer, Source, useMap } from "react-map-gl/mapbox";
import type { CircleLayerSpecification } from "react-map-gl/mapbox";
import { useCallback, useEffect, useState } from "react";
import { IoMdLocate } from "react-icons/io";
import { useGeolocation } from "../hooks/useGeolocation";

const GeolocateControl = () => {
  const [isInitialCenteringDone, setIsInitialCenteringDone] = useState(false);
  const { position } = useGeolocation();

  const { map } = useMap();

  useEffect(() => {
    if (!map || !position) return;

    if (!isInitialCenteringDone) {
      map.flyTo({
        center: [position.longitude, position.latitude],
        zoom: 14,
        speed: 1.2,
      });

      setIsInitialCenteringDone(true);
    }
  }, [position, map]);

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

  return (
    <>
      <div
        className="map-control map-control--geolocate"
        onClick={handleGeolocateClick}
      >
        <IoMdLocate className="map-control__icon" />
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

export default GeolocateControl;
