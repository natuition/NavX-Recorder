import PWABadge from "./PWABadge.tsx";
import "./App.css";
import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState } from "react";
import CurrentPosition from "./components/CurrentLocation.tsx";
import { useBluetooth } from "./contexts/BluetoothContext.tsx";
import ZoneGeometry from "./components/ZoneGeometry.tsx";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

if (!MAPBOX_ACCESS_TOKEN) {
  console.error(
    "VITE_MAPBOX_ACCESS_TOKEN n'est pas défini dans le fichier .env"
  );
}

const App = () => {
  console.log("App rendered");
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);

  const { bluetoothConnected, connectBluetooth, disconnectBluetooth } =
    useBluetooth();

  return (
    <div className="map-container">
      <Map
        id="map"
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        interactive
        initialViewState={{
          longitude: -1.1517,
          latitude: 46.1591,
          zoom: 10,
        }}
        mapStyle="mapbox://styles/vincentlb/cmfwcr7jb008101sc99fk3cfo"
        attributionControl={false}
        onLoad={() => setIsMapLoaded(true)}
        onMove={(evt) => {
          console.log("Map moved:", evt.viewState);
        }}
      >
        {isMapLoaded && (
          <>
            <header className="header">
              <h1>NavX</h1>
              <div className="header-buttons">
                <button
                  onClick={
                    bluetoothConnected ? disconnectBluetooth : connectBluetooth
                  }
                  style={{
                    backgroundColor: bluetoothConnected ? "#dc3545" : "#007bff",
                  }}
                >
                  {bluetoothConnected ? "Disconnect BLE" : "Connect BLE"}
                </button>
              </div>
            </header>

            <CurrentPosition />
            <ZoneGeometry />
          </>
        )}
      </Map>

      <PWABadge />
    </div>
  );
};

export default App;
