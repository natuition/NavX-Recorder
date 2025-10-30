import { useMemo } from "react";

interface FixStatusProps {
  fixQuality: number | undefined;
}

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

const FixStatus = ({ fixQuality }: FixStatusProps) => {
  const fixInfo = useMemo(() => {
    const qualityMap: Record<number, FixQualityType> = {
      0: "NONE",
      1: "GPS",
      2: "DGPS",
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
