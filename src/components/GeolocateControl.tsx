import { Marker, useMap } from "react-map-gl/mapbox";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { IoMdLocate } from "react-icons/io";
import { useGeolocation } from "../hooks/useGeolocation";
import { useToast } from "../hooks/useToast";

const GeolocateControl = () => {
  const [isInitialCenteringDone, setIsInitialCenteringDone] = useState(false);
  const { position } = useGeolocation();

  const { map } = useMap();
  const toast = useToast();

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

    if (!position) {
      console.warn("Position is not available, could not geolocate.");
      toast.warn("Position GPS non disponible");
      return;
    }

    map.flyTo({
      center: [position.longitude, position.latitude],
      zoom: 18,
      speed: 1.2,
    });
  }, [map, position]);

  return (
    <>
      <div
        className="map-control map-control--geolocate"
        onClick={handleGeolocateClick}
      >
        <IoMdLocate className="map-control__icon" />
      </div>
      {isInitialCenteringDone && position && (
        <Marker
          style={currentPositionMarkerStyle}
          longitude={position!.longitude}
          latitude={position!.latitude}
        >
          <span className="map-control--current-position"></span>
        </Marker>
      )}
    </>
  );
};

export default GeolocateControl;

/**
 * Style appliqué au marqueur de la position actuelle.
 * Permet de le styliser par le biais du contenu avec une classe CSS.
 */
const currentPositionMarkerStyle: CSSProperties = {
  height: "20px",
  width: "20px",
  position: "relative",
};
