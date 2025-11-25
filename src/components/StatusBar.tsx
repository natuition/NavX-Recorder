import { useGeolocation } from "../contexts/GeolocationContext";
import { TbWorldLongitude, TbWorldLatitude } from "react-icons/tb";
import { RiGpsFill } from "react-icons/ri";
import { FaSatellite } from "react-icons/fa6";
import { IoAlertCircleOutline } from "react-icons/io5";
import { useBluetooth } from "../contexts/BluetoothContext";

interface FixQualityInfo {
  id: string;
  label: string;
  slug: string;
}

const FIX_QUALITY_MAP: Record<number, FixQualityInfo> = {
  0: {
    id: "NO_FIX",
    label: "Aucun signal",
    slug: "none",
  },
  1: {
    id: "GPS",
    label: "GPS",
    slug: "gps",
  },
  2: {
    id: "DGPS",
    label: "DGPS",
    slug: "dgps",
  },
  4: {
    id: "RTK_FIXED",
    label: "RTK Fixed",
    slug: "rtk-fixed",
  },
  5: {
    id: "RTK_FLOAT",
    label: "RTK Float",
    slug: "rtk-float",
  },
};

const StatusBar = () => {
  const { position } = useGeolocation();
  const { bluetoothConnected, connectBluetooth } = useBluetooth();

  const handleConnectNavX = () => {
    if (!bluetoothConnected) {
      connectBluetooth();
    }
  };

  const fixLabel = FIX_QUALITY_MAP[position?.fixQuality ?? 0]?.label;
  const fixSlug = FIX_QUALITY_MAP[position?.fixQuality ?? 0]?.slug;

  return (
    <div className="status-bar">
      {position ? (
        <div className="status-bar__indicators">
          <div className="indicator">
            <FaSatellite size={18} className="indicator__icon" />
            <p className="indicator__data">{position?.numSatellites}</p>
          </div>

          <div className="indicator">
            <TbWorldLatitude size={18} className="indicator__icon" />
            <p className="indicator__data">{position?.latitude.toFixed(6)}</p>
          </div>

          <div className="indicator">
            <TbWorldLongitude size={18} className="indicator__icon" />
            <p className="indicator__data">{position?.longitude.toFixed(6)}</p>
          </div>

          <div className="indicator">
            <RiGpsFill size={18} className="indicator__icon" />
            <p className="indicator__data">{fixLabel}</p>
            <span
              className={`indicator__level indicator__level--${fixSlug}`}
            ></span>
          </div>
        </div>
      ) : (
        <div className="status-bar__indicators">
          <p className="status-bar__info-msg">Position GPS non disponible</p>
          <button
            onClick={handleConnectNavX}
            className="button button--neutral status-bar__connect-ble"
          >
            Connecter NavX
          </button>
        </div>
      )}
    </div>
  );
};

export default StatusBar;
