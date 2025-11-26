import { Map as ReactMap } from "react-map-gl/mapbox";
import { useState, type ReactNode } from "react";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MAP_INITIAL_LATITUDE = 46.1591;
const MAP_INITIAL_LONGITUDE = -1.1517;

export const Map = ({ children }: { children: ReactNode }) => {
  console.log("map layout rendered"); // --- IGNORE ---
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  return (
    <div className="map-container">
      <ReactMap
        id="map"
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
  );
};
