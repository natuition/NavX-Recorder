import { useMemo } from "react";

interface FixStatusProps {
  fixQuality: number | undefined;
}

type FixQualityType =
  | "NO_FIX"
  | "GPS"
  | "DGPS"
  | "PPS"
  | "RTK_FIXED"
  | "RTK_FLOAT";

interface FixQualityInfo {
  label: string;
  description: string;
  color: string;
  icon: string;
}

const FIX_QUALITY_MAP: Record<FixQualityType, FixQualityInfo> = {
  NO_FIX: {
    label: "No Fix",
    description: "Pas de signal GPS",
    color: "#808080",
    icon: "❌",
  },
  GPS: {
    label: "GPS",
    description: "Position GPS standard",
    color: "#ffaa00",
    icon: "📍",
  },
  DGPS: {
    label: "DGPS",
    description: "GPS différentiel",
    color: "#ffff00",
    icon: "📍",
  },
  PPS: {
    label: "PPS",
    description: "Precise Point Positioning",
    color: "#00ff00",
    icon: "✓",
  },
  RTK_FIXED: {
    label: "RTK Fixed",
    description: "RTK avec solution fixe",
    color: "#0066ff",
    icon: "🎯",
  },
  RTK_FLOAT: {
    label: "RTK Float",
    description: "RTK avec solution flottante",
    color: "#00ccff",
    icon: "📡",
  },
};

const FixStatus = ({ fixQuality }: FixStatusProps) => {
  const fixInfo = useMemo(() => {
    const qualityMap: Record<number, FixQualityType> = {
      0: "NO_FIX",
      1: "GPS",
      2: "DGPS",
      3: "PPS",
      4: "RTK_FIXED",
      5: "RTK_FLOAT",
    };

    const qualityType = qualityMap[fixQuality ?? 0] || "NO_FIX";
    return FIX_QUALITY_MAP[qualityType];
  }, [fixQuality]);

  return (
    <div className="fix-legend">
      <div className="fix-indicator" style={{ backgroundColor: fixInfo.color }}>
        <span className="fix-icon">{fixInfo.icon}</span>
      </div>
      <div className="fix-info">
        <h3 className="fix-label">{fixInfo.label}</h3>
        <p className="fix-description">{fixInfo.description}</p>
      </div>
    </div>
  );
};

export default FixStatus;
