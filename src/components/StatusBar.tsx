import { useBluetooth } from "../contexts/BluetoothContext";
import { useGeolocation } from "../contexts/GeolocationContext";

type FixQualityType = "NONE" | "GPS" | "DGPS" | "RTK_FIXED" | "RTK_FLOAT";

interface FixQualityInfo {
  label: string;
}

const FIX_QUALITY_MAP: Record<FixQualityType, FixQualityInfo> = {
  NONE: {
    label: "None",
  },
  GPS: {
    label: "GPS",
  },
  DGPS: {
    label: "DGPS",
  },
  RTK_FIXED: {
    label: "RTK Fixed",
  },
  RTK_FLOAT: {
    label: "RTK Float",
  },
};

const StatusBar = () => {
  const { position } = useGeolocation();
  const { bluetoothConnected } = useBluetooth();

  const fixQuality = () => {
    const qualityMap: Record<number, FixQualityType> = {
      0: "NONE",
      1: "GPS",
      2: "DGPS",
      4: "RTK_FIXED",
      5: "RTK_FLOAT",
    };

    const qualityType = qualityMap[position?.fixQuality ?? 0] || "NO_FIX";
    return FIX_QUALITY_MAP[qualityType].label;
  };

  return (
    <div style={styles.container}>
      {position && <div style={styles.item}>🛰️ {position?.numSatellites}</div>}
      {position && (
        <div style={styles.item}> Lat : {position?.latitude.toFixed(6)}</div>
      )}
      {position && (
        <div style={styles.item}>Lon : {position?.longitude.toFixed(6)}</div>
      )}
      {position && <div style={styles.item}>🌐 {fixQuality()}</div>}
      <div style={styles.item}>
        🔵
        <span
          style={{
            color: bluetoothConnected ? "limegreen" : "red",
            fontWeight: "bold",
          }}
        >
          {bluetoothConnected ? "Connecté" : "Déconnecté"}
        </span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "absolute",
    top: "75px",
    left: 0,
    width: "100%",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    color: "white",
    padding: "8px 0",
    fontFamily: "sans-serif",
    fontSize: "14px",
    zIndex: 1000,
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
};

export default StatusBar;
