import { IoMap, IoFolderOpen, IoSearchSharp } from "react-icons/io5";
import { IoMdMore } from "react-icons/io";
import { useState } from "react";
import TabsButton from "./TabsButton";
import { useApp } from "../contexts/AppContext";
import TabsMenu from "./TabsMenu";

const Tabs = () => {
  const { currentPage, setCurrentPage } = useApp();

  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

  return (
    <>
      <TabsMenu active={isMenuVisible} onHide={() => setIsMenuVisible(false)} />
      <nav className="tabs-container">
        <ul className="tabs">
          <li
            className={`tab ${currentPage === "Home" ? "tab--active" : ""}`}
            onClick={() => setCurrentPage("Home")}
          >
            <IoMap size={24} />
            <span className="tab__label">Carte</span>
          </li>
          <li
            className={`tab ${currentPage === "Projects" ? "tab--active" : ""}`}
            onClick={() => setCurrentPage("Projects")}
          >
            <IoFolderOpen size={24} />
            <span className="tab__label">Projets</span>
          </li>
          <TabsButton onPress={() => setIsMenuVisible(true)} />
          <li
            className={`tab ${currentPage === "Search" ? "tab--active" : ""}`}
            onClick={() => setCurrentPage("Search")}
          >
            <IoSearchSharp size={24} />
            <span className="tab__label">Rechercher</span>
          </li>
          <li
            className={`tab ${currentPage === "Settings" ? "tab--active" : ""}`}
            onClick={() => setCurrentPage("Settings")}
          >
            <IoMdMore size={24} />
            <span className="tab__label">Paramètres</span>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Tabs;
