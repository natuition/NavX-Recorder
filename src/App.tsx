import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { useBluetooth } from "./contexts/BluetoothContext.tsx";
import useNtripClient from "./hooks/useNtripClient.ts";
import { useGeolocation } from "./hooks/useGeolocation.ts";

const App = () => {
  console.debug("render App");
  const position = useGeolocation();

  const { nearestMountpoint, disconnectNtrip } = useNtripClient({
    latitude: position?.latitude,
    longitude: position?.longitude,
  });

  const { bluetoothConnected, connectBluetooth, disconnectBluetooth } =
    useBluetooth();

  const handleDisconnectBluetooth = async () => {
    console.log("Disconnecting Bluetooth and NTRIP...");
    await disconnectBluetooth();
    disconnectNtrip();
  };

  return (
    <main>
      <h1>NavX Recorder</h1>
      <div>
        <ul>
          <li>Latitude: {position?.latitude}</li>
          <li>Longitude: {position?.longitude}</li>
          <li>Fix: {position?.fixQuality}</li>
        </ul>
        <h2>Nearest Mountpoint:</h2>
        {nearestMountpoint && (
          <ul>
            <li key={nearestMountpoint.mountpoint}>
              [{nearestMountpoint.mountpoint}] {nearestMountpoint.identifier} -
              Distance: {nearestMountpoint.distance?.toFixed(2)} meters
            </li>
          </ul>
        )}

        <button
          onClick={() =>
            bluetoothConnected
              ? handleDisconnectBluetooth()
              : connectBluetooth()
          }
        >
          {bluetoothConnected ? "Disconnect BT" : "Connect BT"}
        </button>
      </div>
    </main>
  );
};

export default App;
