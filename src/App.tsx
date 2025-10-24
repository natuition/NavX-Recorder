import PWABadge from "./PWABadge.tsx";
import "./App.css";
import Map, { type ViewState } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useCallback, useEffect } from "react";
import { useNavigatorGeolocation } from "./hooks/useNavigatorGeolocation.ts";
import CurrentPosition from "./components/CurrentPosition.tsx";
import { useBluetooth } from "./contexts/BluetoothContext.tsx";
import ZoneGeometry from "./components/ZoneGeometry.tsx";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

if (!MAPBOX_ACCESS_TOKEN) {
  console.error(
    "VITE_MAPBOX_ACCESS_TOKEN n'est pas défini dans le fichier .env"
  );
}

function App() {
  const { bluetoothConnected, connectBluetooth, disconnectBluetooth } =
    useBluetooth();

  const [mapLoaded, setMapLoaded] = useState(false);
  const { currentLocation } = useNavigatorGeolocation();

  const [mapViewState, setMapViewState] = useState<ViewState>({
    longitude: -1.1517,
    latitude: 46.1591,
    zoom: 12,
    bearing: 0,
    elevation: 0,
    pitch: 0,
    padding: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  });

  // Centrer la carte sur la position actuelle quand elle est obtenue
  useEffect(() => {
    if (currentLocation) {
      setMapViewState((prev) => ({
        ...prev,
        zoom: 16,
        longitude: currentLocation[0],
        latitude: currentLocation[1],
      }));
    }
  }, [currentLocation]);

  const handleMapLoaded = useCallback(() => {
    setMapLoaded(true);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100svh",
        width: "100svw",
        position: "relative",
      }}
    >
      <Map
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        initialViewState={{
          longitude: currentLocation?.[0] || -1.1517,
          latitude: currentLocation?.[1] || 46.1591,
          zoom: 12,
        }}
        viewState={mapViewState}
        mapStyle="mapbox://styles/vincentlb/cmfwcr7jb008101sc99fk3cfo"
        attributionControl={false}
        onLoad={handleMapLoaded}
        onMove={(evt) => {
          setMapViewState(evt.viewState);
        }}
        style={{
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        {mapLoaded && (
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
}

export default App;
