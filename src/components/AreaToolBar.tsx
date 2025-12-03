import { FaSave, FaPlayCircle } from "react-icons/fa";
import { FaDrawPolygon, FaPause } from "react-icons/fa6";
import { IoIosUndo } from "react-icons/io";
import { MdLocationOn, MdOutlineAddLocationAlt } from "react-icons/md";

type AreaToolBarProps = {
  /**
   * Surface mesurée en unités carrées.
   */
  area: number;
  /**
   * Unité de mesure de la surface (par défaut "m²").
   */
  unit?: string;
  /**
   * Indique si l'enregistrement est en cours ou non.
   */
  isRecording?: boolean;
  /**
   * Callback appelé lorsque l'utilisateur clique sur le bouton "Enregistrer".
   */
  onSave: () => void;
  /**
   * Callback appelé lorsque l'utilisateur clique sur le bouton de suppression du dernier point.
   */
  onRemoveLast?: () => void;
  /**
   * Callback appelé lorsque l'utilisateur clique sur le bouton d'ajout de point.
   */
  onAdd: () => void;
  /**
   * Callback appelé lorsque l'utilisateur clique sur le bouton d'enregistrement/pause.
   */
  onToggleRecording: () => void;
  /**
   * Nombre de points constituant la surface mesurée.
   */
  nbPoints?: number;
};

/**
 * Barre d'outils pour la mesure de surface.
 */
const AreaToolBar = ({
  area,
  unit = "m²",
  nbPoints = 0,
  isRecording,
  onToggleRecording,
  onSave,
  onRemoveLast,
  onAdd,
}: AreaToolBarProps) => {
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
              {area.toFixed(2)} {unit}
            </p>
          </div>
        </div>
      </div>
      <div className="toolbar__actions">
        <div className="wrapper">
          <button
            onClick={onRemoveLast}
            className="button button--neutral toolbar__action"
          >
            <IoIosUndo size={18} />
          </button>
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
              isRecording ? "neutral" : "primary"
            } toolbar__action`}
            onClick={onToggleRecording}
          >
            {isRecording ? "Pause" : "Démarrer"}
            {isRecording ? <FaPause size={18} /> : <FaPlayCircle size={18} />}
          </button>
          <button
            onClick={onAdd}
            className="button button--primary toolbar__action"
          >
            <MdOutlineAddLocationAlt size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AreaToolBar;
