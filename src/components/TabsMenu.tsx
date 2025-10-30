import { FaDrawPolygon, FaRuler } from "react-icons/fa";
import { useApp } from "../contexts/AppContext";

type TabsMenuProps = {
  active: boolean;
  onHide: () => void;
};

const TabsMenu = ({ onHide, active }: TabsMenuProps) => {
  const { setCurrentTool } = useApp();

  return (
    <div onClick={onHide} id="scrim" className={active ? "" : "invisible"}>
      <ul className="action-menu">
        <li className="action-menu__item">
          <button
            className="action-menu__button"
            onClick={() => {
              setCurrentTool("Distance");
            }}
          >
            <FaRuler size={24} />
            Distance
          </button>
        </li>
        <li className="action-menu__item">
          <button
            className="action-menu__button"
            onClick={() => {
              setCurrentTool("Surface");
            }}
          >
            <FaDrawPolygon size={24} />
            Surface
          </button>
        </li>
      </ul>
    </div>
  );
};

export default TabsMenu;
