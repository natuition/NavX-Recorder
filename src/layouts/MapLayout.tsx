import Map from "react-map-gl/mapbox";
import { useState, type ReactNode } from "react";
import {
  MdOutlineBluetooth,
  MdOutlineBluetoothConnected,
} from "react-icons/md";
import { useBluetooth } from "../contexts/BluetoothContext";
import CurrentLocation from "../components/CurrentLocation";
import { GeolocationProvider } from "../contexts/GeolocationContext";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
const MAP_INITIAL_LATITUDE = 46.1591;
const MAP_INITIAL_LONGITUDE = -1.1517;

// const Camera = () => {
//   const { initialLocation } = useNavigatorGeolocation();

//   const { current: map } = useMap();

//   useEffect(() => {
//     if (!map) return;

//     if (initialLocation) {
//       map.flyTo({
//         center: [initialLocation[0], initialLocation[1]],
//         zoom: 14,
//         speed: 1.2,
//       });
//     }
//   }, [initialLocation, map]);

//   return <></>;
// };

export const MapLayout = ({ children }: { children: ReactNode }) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { bluetoothConnected, connectBluetooth, disconnectBluetooth } =
    useBluetooth();

  return (
    <div className="map-container">
      <Map
        id="map"
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
        initialViewState={{
          longitude: MAP_INITIAL_LONGITUDE,
          latitude: MAP_INITIAL_LATITUDE,
          zoom: 1.5,
        }}
        mapStyle="mapbox://styles/vincentlb/cmfwcr7jb008101sc99fk3cfo"
        attributionControl={false}
        onLoad={() => setIsMapLoaded(true)}
      >
        {isMapLoaded && (
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
        )}

        {isMapLoaded && (
          <GeolocationProvider>
            <CurrentLocation />
            {children}
          </GeolocationProvider>
        )}
      </Map>
    </div>
  );
};
