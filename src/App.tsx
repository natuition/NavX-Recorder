import PWABadge from "./PWABadge.tsx";
import "./App.css";
import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState } from "react";
import { useBluetooth } from "./contexts/BluetoothContext.tsx";
import BaseLayout from "./layouts/BaseLayout.tsx";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MAP_INITIAL_LATITUDE = 46.1591;
const MAP_INITIAL_LONGITUDE = -1.1517;

if (!MAPBOX_ACCESS_TOKEN) {
  console.error(
    "VITE_MAPBOX_ACCESS_TOKEN n'est pas défini dans le fichier .env"
  );
}

const App = () => {
  console.log("App rendered");
  const [isMapLoaded, setIsMapLoaded] = useState<boolean>(false);
  const [mapCenterPosition, setMapCenterPosition] = useState<number[] | null>([
    MAP_INITIAL_LONGITUDE,
    MAP_INITIAL_LATITUDE,
  ]);

  const { bluetoothConnected, connectBluetooth, disconnectBluetooth } =
    useBluetooth();

  const [position, setPosition] = useState<GpsPosition | null>(null);

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
              <header className="header">
                <h1>NavX</h1>
                <div className="header-buttons">
                  <button
                    onClick={
                      bluetoothConnected
                        ? disconnectBluetooth
                        : connectBluetooth
                    }
                    style={{
                      backgroundColor: bluetoothConnected
                        ? "#dc3545"
                        : "#007bff",
                    }}
                  >
                    {bluetoothConnected ? "Disconnect BLE" : "Connect BLE"}
                  </button>
                </div>
              </header>
            </>
          )}
        </Map>

        <PWABadge />
      </div>
    </BaseLayout>
  );
};

export default App;
