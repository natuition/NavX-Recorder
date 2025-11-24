import { FaDrawPolygon, FaRuler } from "react-icons/fa";
import { useApp } from "../contexts/AppContext";

type ActionMenuProps = {
  active: boolean;
  onHide: () => void;
};

const ActionMenu = ({ onHide, active }: ActionMenuProps) => {
  const { setCurrentTool } = useApp();

  return (
    <div
      onClick={onHide}
      className={`action-menu__overlay ${active ? "" : "invisible"}`}
    >
      <ul className="action-menu">
        <li className="action-menu__item">
          <button
            className="button"
            onClick={() => {
              setCurrentTool("Distance");
            }}
          >
            <FaRuler className="button__icon-left" size={24} />
            Distance
          </button>
        </li>
        <li className="action-menu__item">
          <button
            className="button"
            onClick={() => {
              setCurrentTool("Surface");
            }}
          >
            <FaDrawPolygon className="button__icon-left" size={24} />
            Surface
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ActionMenu;
