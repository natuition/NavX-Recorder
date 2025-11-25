import Map from "react-map-gl/mapbox";
import { useState } from "react";

import { Outlet } from "react-router";
import { GeolocationProvider } from "../contexts/GeolocationContext";
import CurrentLocation from "../components/CurrentLocation";
import StatusBar from "../components/StatusBar";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MAP_INITIAL_LATITUDE = 46.1591;
const MAP_INITIAL_LONGITUDE = -1.1517;

export const MapLayout = () => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  return (
    <div className="map-container">
      <Map
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
        {isMapLoaded && (
          <GeolocationProvider>
            <StatusBar />
            <CurrentLocation />
            <Outlet />
          </GeolocationProvider>
        )}
      </Map>
    </div>
  );
};
