import { Outlet } from "react-router";
import StatusBar from "../components/StatusBar";
import { ScaleControl, useMap } from "react-map-gl/mapbox";
import type { CSSProperties } from "react";
import GeolocateControl from "../components/GeolocateControl";

const SCALE_CONTROL_UNIT = "metric";

/**
 * Couche de mise ne page pour les éléments liés à la carte.
 */
export const MapLayout = () => {
  const { map } = useMap();

  const handleZoomIn = () => {
    map?.zoomIn();
  };
  const handleZoomOut = () => {
    map?.zoomOut();
  };

  return (
    <>
      <StatusBar />
      <div className="map-layout__controls">
        <GeolocateControl />
        {/* TODO: Remplacer par des composants */}
        <p className="map-control" onClick={handleZoomIn}>
          <span className="map-control__icon">+</span>
        </p>
        <p className="map-control" onClick={handleZoomOut}>
          <span className="map-control__icon">-</span>
        </p>
      </div>

      <ScaleControl
        unit={SCALE_CONTROL_UNIT}
        position="bottom-right"
        style={scaleControlStyle}
      />
      <Outlet />
    </>
  );
};

/**
 * Style appliqué au conteneur du contrôle d’échelle.
 * Mapbox ne permet pas de personnaliser sa position nativement.
 */
const scaleControlStyle: CSSProperties = {
  position: "absolute",
  bottom: 80,
  right: 10,
  marginRight: 0,
};
