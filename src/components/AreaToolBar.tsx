import { FaSave } from "react-icons/fa";
import { PiPolygonFill } from "react-icons/pi";
import { IoIosUndo } from "react-icons/io";
import { CiRuler } from "react-icons/ci";

import { MdLocationOn, MdOutlineAddLocationAlt } from "react-icons/md";

type AreaToolBarProps = {
  /**
   * Surface mesurée en unités carrées.
   */
  area: number;
  /**
   *  Périmètre de la surface.
   */
  perimeter: number;
  /**
   * Unité de mesure de la surface (par défaut "m²").
   */
  unit?: string;
  /**
   * Indique si l'enregistrement est en cours ou non.
   */
  isRecording?: boolean;
  /**
   * Indique si la mesure peut être sauvegardée.
   */
  canSave: boolean;
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
   * Nombre d'angles constituant la surface mesurée.
   */
  corners?: number;
};

/**
 * Barre d'outils pour la mesure de surface.
 */
const AreaToolBar = ({
  area,
  perimeter,
  unit = "m²",
  corners = 0,
  canSave,
  isRecording,
  onSave,
  onRemoveLast,
  onAdd,
}: AreaToolBarProps) => {
  return (
    <div className="toolbar">
      <div className="toolbar__infos">
        <div className="wrapper">
          <div className="toolbar-indicator">
            <PiPolygonFill className="toolbar-indicator__icon" size={18} />
            <p className="toolbar-indicator__data">
              {area.toFixed(2)} {unit}
            </p>
          </div>
          <div className="toolbar-indicator">
            <CiRuler className="toolbar-indicator__icon" size={18} />
            <p className="toolbar-indicator__data">{perimeter.toFixed(1)} m</p>
          </div>
          <div className="toolbar-indicator">
            <MdLocationOn className="toolbar-indicator__icon" size={18} />
            <p className="toolbar-indicator__data">{corners}</p>
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
            disabled={!canSave}
            className={`button button--${
              canSave ? "primary" : "neutral"
            } toolbar__action`}
            onClick={onSave}
          >
            Enregistrer
            <FaSave size={18} />
          </button>
          <button
            onClick={onAdd}
            className={`button button--draw toolbar__action ${
              isRecording ? "toolbar__action--draw--active" : ""
            }`}
          >
            <MdOutlineAddLocationAlt size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AreaToolBar;
