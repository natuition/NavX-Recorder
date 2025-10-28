import Tabs from "../components/Tabs.tsx";
import ToolBar from "../components/ToolBar.tsx";
import { useApp } from "../contexts/AppContext.tsx";

import { FaRuler, FaDrawPolygon } from "react-icons/fa";

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  const { state, toggleActionMenu } = useApp();

  return (
    <div className="base-layout">
      <div
        onClick={() => toggleActionMenu()}
        id="scrim"
        className={state.isActionMenuOpen ? "" : "invisible"}
      >
        <ul className="action-menu">
          <li className="action-menu__item">
            <button
              className="action-menu__button"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <FaRuler size={24} />
              Distance
            </button>
          </li>
          <li className="action-menu__item">
            <button
              className="action-menu__button"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <FaDrawPolygon size={24} />
              Surface
            </button>
          </li>
        </ul>
      </div>
      <ToolBar />
      {children}
      <Tabs />
    </div>
  );
};

export default BaseLayout;
