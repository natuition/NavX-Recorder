import PWABadge from "./PWABadge.tsx";
import "./App.css";
import Map from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useCallback, useEffect } from "react";
import { useNavigatorGeolocation } from "./hooks/useNavigatorGeolocation.ts";
import CurrentPosition from "./components/CurrentPosition.tsx";
import { useBluetooth } from "./contexts/BluetoothContext.tsx";
import ZoneGeometry from "./components/ZoneGeometry.tsx";

type MapCamera = {
  longitude: number;
  latitude: number;
  zoom: number;
};

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

if (!MAPBOX_ACCESS_TOKEN) {
  console.error(
    "VITE_MAPBOX_ACCESS_TOKEN n'est pas défini dans le fichier .env"
  );
}

function App() {
  console.debug("___Render: App");
  const { bluetoothConnected, connectBluetooth, disconnectBluetooth } =
    useBluetooth();

  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const { currentLocation } = useNavigatorGeolocation();

  const [mapCamera, setMapCamera] = useState<MapCamera>({
    longitude: -1.1517,
    latitude: 46.1591,
    zoom: 12,
  });

  // Centrer la carte sur la position actuelle quand elle est obtenue
  useEffect(() => {
    if (currentLocation) {
      setMapCamera({
        longitude: currentLocation[0],
        latitude: currentLocation[1],
        zoom: 14,
      });
    }
  }, [currentLocation]);

  const handleMapLoaded = useCallback(() => {
    setMapLoaded(true);
  }, []);

  return (
    <div className="map-container">
      <Map
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        interactive
        initialViewState={{
          longitude: -1.1517,
          latitude: 46.1591,
          zoom: 10,
        }}
        viewState={{
          longitude: mapCamera.longitude,
          latitude: mapCamera.latitude,
          zoom: mapCamera.zoom,
          bearing: 0,
          pitch: 0,
          padding: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          },
          width: 0,
          height: 0,
        }}
        mapStyle="mapbox://styles/vincentlb/cmfwcr7jb008101sc99fk3cfo"
        attributionControl={false}
        onLoad={handleMapLoaded}
        onMove={(evt) => {
          console.log("Map moved:", evt.viewState);
          setMapCamera((prev) => ({
            ...prev,
            longitude: evt.viewState.longitude,
            latitude: evt.viewState.latitude,
            zoom: evt.viewState.zoom,
          }));
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

            <CurrentPosition position={currentLocation} />
            <ZoneGeometry />
          </>
        )}
      </Map>

      <PWABadge />
    </div>
  );
}

export default App;
