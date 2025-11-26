import { Map as ReactMap } from "react-map-gl/mapbox";
import { useState, type ReactNode } from "react";
import { MapProvider as _MapProvider } from "react-map-gl/mapbox";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MAP_INITIAL_LATITUDE = 46.1591;
const MAP_INITIAL_LONGITUDE = -1.1517;

/**
 * Ce composant est un wrapper pour le fournisseur de contexte de la carte Mapbox.
 * Garantit un rendu unique de la carte et permet aux composants enfants d'accéder au contexte de la carte.
 */
export const MapProvider = ({ children }: { children: ReactNode }) => {
  console.log("map layout rendered"); // --- IGNORE ---
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  return (
    <_MapProvider>
      <div className="map-container">
        <ReactMap
          id="map"
          reuseMaps
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          initialViewState={{
            longitude: MAP_INITIAL_LONGITUDE,
            latitude: MAP_INITIAL_LATITUDE,
            zoom: 10,
          }}
          mapStyle="mapbox://styles/vincentlb/cmfwcr7jb008101sc99fk3cfo"
          attributionControl={false}
          onLoad={() => setIsMapLoaded(true)}
        >
          {isMapLoaded && <>{children}</>}
        </ReactMap>
      </div>
    </_MapProvider>
  );
};
