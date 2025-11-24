import Map from "react-map-gl/mapbox";
import { useState, type ReactNode } from "react";
import {
  MdOutlineBluetooth,
  MdOutlineBluetoothConnected,
} from "react-icons/md";
import { useBluetooth } from "../contexts/BluetoothContext";
import CurrentLocation from "../components/CurrentLocation";
import { GeolocationProvider } from "../contexts/GeolocationContext";
import { useModal } from "../hooks/useModal";
import { Modal } from "../components/Modal";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MAP_INITIAL_LATITUDE = 46.1591;
const MAP_INITIAL_LONGITUDE = -1.1517;

export const MapLayout = ({ children }: { children: ReactNode }) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { bluetoothConnected, connectBluetooth, disconnectBluetooth } =
    useBluetooth();

  const modal = useModal();

  const handleBluetoothDisconnect = async () => {
    await disconnectBluetooth();
    modal.close();
  };

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
          <div
            onClick={bluetoothConnected ? modal.open : connectBluetooth}
            id="bluetoothControl"
          >
            {bluetoothConnected ? (
              <MdOutlineBluetoothConnected size={24} />
            ) : (
              <MdOutlineBluetooth size={24} className="disconnected" />
            )}
          </div>
        )}

        {isMapLoaded && (
          <GeolocationProvider>
            <CurrentLocation />
            {children}
          </GeolocationProvider>
        )}

        {isMapLoaded && (
          <Modal
            message="Déconnecter le Bluetooth ?"
            noLabel="Annuler"
            onYes={handleBluetoothDisconnect}
            onNo={modal.close}
            isOpen={modal.isOpen}
            onClose={modal.close}
            status="info"
          ></Modal>
        )}
      </Map>
    </div>
  );
};
