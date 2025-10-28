import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";
import BaseLayout from "./layouts/BaseLayout.tsx";
import CurrentLocation from "./components/CurrentLocation.tsx";
import PWABadge from "./PWABadge.tsx";
import { useState } from "react";
import Map from "react-map-gl/mapbox";
import {
  MdOutlineBluetooth,
  MdOutlineBluetoothConnected,
} from "react-icons/md";
import { useBluetooth } from "./contexts/BluetoothContext.tsx";
import FixStatus from "./components/FixStatus.tsx";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MAP_INITIAL_LATITUDE = 46.1591;
const MAP_INITIAL_LONGITUDE = -1.1517;

const App = () => {
  // console.debug("render App");

  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const { bluetoothConnected, connectBluetooth, disconnectBluetooth } =
    useBluetooth();

  return (
    <BaseLayout>
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
            <>
              <div
                onClick={
                  bluetoothConnected ? disconnectBluetooth : connectBluetooth
                }
                id="bluetoothControl"
              >
                {bluetoothConnected ? (
                  <MdOutlineBluetoothConnected size={24} />
                ) : (
                  <MdOutlineBluetooth size={24} className="disconnected" />
                )}
              </div>

              <CurrentLocation />
            </>
          )}
        </Map>

        <PWABadge />
      </div>
    </BaseLayout>
  );
};

export default App;
