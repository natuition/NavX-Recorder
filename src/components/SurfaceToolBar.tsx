import { FaSave } from "react-icons/fa";
import { FaDrawPolygon } from "react-icons/fa6";
import { MdLocationOn } from "react-icons/md";
import { FaPlayCircle } from "react-icons/fa";
import { FaPause } from "react-icons/fa6";

interface SurfaceToolBarProps {
  surface: number;
  unit?: string;
  isRecording?: boolean;
  onSave: () => void;
  onToggleRecording: () => void;
  nbPoints?: number;
}

export const SurfaceToolBar = ({
  surface,
  unit = "m²",
  nbPoints = 0,
  isRecording,
  onToggleRecording,
  onSave,
}: SurfaceToolBarProps) => {
  return (
    <div className="toolbar">
      <div className="toolbar__infos">
        <div className="wrapper">
          <div className="toolbar-indicator">
            <MdLocationOn className="toolbar-indicator__icon" size={18} />
            <p className="toolbar-indicator__data">{nbPoints}</p>
          </div>
          <div className="toolbar-indicator">
            <FaDrawPolygon className="toolbar-indicator__icon" size={18} />
            <p className="toolbar-indicator__data">
              {surface.toFixed(2)} {unit}
            </p>
          </div>
        </div>
      </div>
      <div className="toolbar__actions">
        <button
          disabled={isRecording || nbPoints < 3}
          className="button button--neutral toolbar__action"
          onClick={onSave}
        >
          Enregistrer
          <FaSave size={18} />
        </button>
        <button
          className={`button button--${
            isRecording ? "neutral" : "success"
          } toolbar__action`}
          onClick={onToggleRecording}
        >
          {isRecording ? <FaPause size={18} /> : <FaPlayCircle size={18} />}
        </button>
      </div>
    </div>
  );
};

export default SurfaceToolBar;
