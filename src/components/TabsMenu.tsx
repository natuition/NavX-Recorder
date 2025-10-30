import { FaDrawPolygon, FaRuler } from "react-icons/fa";
import { useApp } from "../contexts/AppContext";
import Measurement from "../pages/Distance";

type TabsMenuProps = {
  active: boolean;
  onHide: () => void;
};

const TabsMenu = ({ onHide, active }: TabsMenuProps) => {
  const { setCurrentPage } = useApp();

  return (
    <div onClick={onHide} id="scrim" className={active ? "" : "invisible"}>
      <ul className="action-menu">
        <li className="action-menu__item">
          <button
            className="action-menu__button"
            onClick={() => {
              setCurrentPage("Distance");
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
              setCurrentPage("Surface");
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
