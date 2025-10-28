import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { useBluetooth } from "./contexts/BluetoothContext.tsx";
import useNtripClient from "./hooks/useNtripClient.ts";
import { useGeolocation } from "./hooks/useGeolocation.ts";
import BaseLayout from "./layouts/BaseLayout.tsx";
import CurrentLocation from "./components/CurrentLocation.tsx";
import PWABadge from "./PWABadge.tsx";
import { useState } from "react";

const App = () => {
  console.debug("render App");

  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const { bluetoothConnected, connectBluetooth, disconnectBluetooth } =
    useBluetooth();

  const handleDisconnectBluetooth = async () => {
    console.debug("Disconnecting Bluetooth and NTRIP...");
    disconnectNtrip();
    await disconnectBluetooth();
  };

  return (
    <BaseLayout>
      <div className="map-container">
        {mapCenterPosition && (
          <h1 id="position">{`Lat: ${mapCenterPosition[1]} , Long: ${mapCenterPosition[0]}`}</h1>
        )}
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
          onMove={(evt) => {
            setMapCenterPosition([
              Number(evt.viewState.longitude.toFixed(4)),
              Number(evt.viewState.latitude.toFixed(4)),
            ]);
          }}
        >
          {isMapLoaded && (
            <>
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
