import { IoIosUndo } from "react-icons/io";
import { FaRuler } from "react-icons/fa";
import { MdOutlineAddLocationAlt, MdLocationOn } from "react-icons/md";
import { FaSave } from "react-icons/fa";

type DistanceToolBarProps = {
  onAdd: () => void;
  onSave: () => void;
  onRemoveLast?: () => void;
  onClearAll?: () => void;
  distance: number;
  nbPoints: number;
};

const DistanceToolBar = ({
  onAdd,
  onSave,
  onRemoveLast,
  onClearAll,
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
            <FaRuler className="toolbar-indicator__icon" size={18} />
            <p className="toolbar-indicator__data">{distance.toFixed(2)} m</p>
          </div>
        </div>
      </div>
      <div className="toolbar__actions">
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
          className="button button--success toolbar__action"
          onClick={onAdd}
        >
          <MdOutlineAddLocationAlt size={18} />
        </button>
      </div>
    </div>
  );
};

export default DistanceToolBar;
