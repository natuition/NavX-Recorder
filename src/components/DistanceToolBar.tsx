import { IoIosUndo } from "react-icons/io";
import { FaSave } from "react-icons/fa";
import { MdOutlineAddLocationAlt, MdLocationOn } from "react-icons/md";
import { SiAlwaysdata } from "react-icons/si";

import type { UnitOption } from "../pages/Distance";

type DistanceToolBarProps = {
  /**
   * Callback appelé lorsque l'utilisateur clique sur le bouton d'ajout de point.
   */
  onAdd: () => void;
  /**
   * Callback appelé lorsque l'utilisateur clique sur le bouton "Enregistrer".
   */
  onSave: () => void;
  /**
   * Callback appelé lorsque l'utilisateur clique sur le bouton de suppression du dernier point.
   */
  onRemoveLast?: () => void;
  /**
   * Distance mesurée en mètres.
   */
  distance: number;
  /**
   * Nombre de points constituant la mesure de distance.
   */
  nbPoints: number;
  /**
   * Unité de mesure utilisée.
   */
  unit: UnitOption;
};

/**
 * Barre d'outils pour la mesure de distance.
 */
const DistanceToolBar = ({
  unit,
  onAdd,
  onSave,
  onRemoveLast,
  distance,
  nbPoints,
}: DistanceToolBarProps) => {
  return (
    <div className="toolbar">
      <div className="toolbar__infos">
        <div className="wrapper">
          <div className="toolbar-indicator">
            <MdLocationOn className="toolbar-indicator__icon" size={18} />
            <p className="toolbar-indicator__data">{nbPoints}</p>
          </div>
          <div className="toolbar-indicator">
            <SiAlwaysdata className="toolbar-indicator__icon" size={18} />
            <p className="toolbar-indicator__data">
              {distance.toFixed(2)} {unit.shortLabel}
            </p>
          </div>
        </div>
      </div>
      <div className="toolbar__actions">
        <div className="wrapper">
          <button
            className="button button--neutral toolbar__action"
            onClick={onRemoveLast}
          >
            <IoIosUndo size={18} />
          </button>
          <button
            disabled={nbPoints < 2}
            className="button button--neutral toolbar__action"
            onClick={onSave}
          >
            Enregistrer
            <FaSave size={18} />
          </button>
          <button
            className="button button--primary toolbar__action"
            onClick={onAdd}
          >
            <MdOutlineAddLocationAlt size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DistanceToolBar;
