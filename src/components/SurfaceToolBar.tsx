import React from "react";

interface SurfaceToolBarProps {
  surface: number; // Surface courante (m², ha, etc.)
  unit?: string; // Optionnel : unité d'affichage
  isRecording?: boolean; // Indique si l'enregistrement est en cours
  onToggleRecording?: () => void; // Callback pour démarrer/arrêter l'enregistrement
  onSave: () => void; // Callback pour sauvegarder
}

/**
 * Barre d’outils positionnée en bas de l’écran,
 * affichant la surface actuelle et un bouton d’enregistrement.
 */
export const SurfaceToolBar: React.FC<SurfaceToolBarProps> = ({
  surface,
  isRecording,
  unit = "m²",
  onToggleRecording,
  onSave,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.info}>
        <span style={styles.label}>Surface :</span>
        <span style={styles.value}>
          {surface.toFixed(2)} {unit}
        </span>
      </div>
      <button style={styles.button} onClick={onToggleRecording}>
        {isRecording ? "⏸️ Stop" : "▶️ Démarrer"}
      </button>
      <button style={styles.button} onClick={onSave}>
        💾 Enregistrer
      </button>
    </div>
  );
};

// 🎨 Styles inline (simples, pas de lib externe)
const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    backgroundColor: "#222",
    color: "#fff",
    boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.3)",
    fontFamily: "sans-serif",
    fontSize: "1rem",
    zIndex: 1000,
  },
  info: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  label: {
    opacity: 0.7,
  },
  value: {
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#4CAF50",
    border: "none",
    color: "white",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default SurfaceToolBar;
