type DistanceToolBarProps = {
  onAdd: () => void;
  onSave: () => void;
  onRemoveLast?: () => void;
  onClearAll?: () => void;
  distance: number;
};

const DistanceToolBar = ({
  onAdd,
  onSave,
  onRemoveLast,
  onClearAll,
  distance,
}: DistanceToolBarProps) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderTop: "1px solid #ccc",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "10px",
        boxShadow: "0 -2px 5px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
      }}
    >
      <button onClick={onRemoveLast} style={buttonStyle}>
        🔙
      </button>

      <button onClick={onClearAll} style={buttonStyle}>
        🗑️
      </button>

      <button onClick={onAdd} style={buttonStyle}>
        ➕
      </button>

      <div style={{ fontWeight: 600 }}>
        Distance totale : {distance.toFixed(2)} m
      </div>

      <button
        onClick={onSave}
        style={{ ...buttonStyle, backgroundColor: "#4CAF50" }}
      >
        💾 Enregistrer
      </button>
    </div>
  );
};

const buttonStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  backgroundColor: "#f5f5f5",
  cursor: "pointer",
  fontSize: "14px",
};

export default DistanceToolBar;
