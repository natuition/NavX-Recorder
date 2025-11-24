import { IoMap, IoFolderOpen, IoSearchSharp } from "react-icons/io5";
import { IoMdMore } from "react-icons/io";
import { useState } from "react";
import TabButton from "./TabButton";
import { useApp } from "../contexts/AppContext";
import ActionMenu from "./ActionMenu";

const Navigation = () => {
  const { currentPage, setCurrentPage } = useApp();

  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

  return (
    <>
      <ActionMenu
        active={isMenuVisible}
        onHide={() => setIsMenuVisible(false)}
      />
      <nav className="navigation">
        <ul className="navigation__tabs">
          <li
            className={`tab ${currentPage === "Home" ? "tab--active" : ""}`}
            onClick={() => setCurrentPage("Home")}
          >
            <IoMap className="tab__icon" size={24} />
            <span className="tab__label">Carte</span>
          </li>
          <li
            className={`tab ${currentPage === "Projects" ? "tab--active" : ""}`}
            onClick={() => setCurrentPage("Projects")}
          >
            <IoFolderOpen className="tab__icon" size={24} />
            <span className="tab__label">Projets</span>
          </li>
          <TabButton onPress={() => setIsMenuVisible(true)} />
          <li
            className={`tab ${currentPage === "Search" ? "tab--active" : ""}`}
            onClick={() => setCurrentPage("Search")}
          >
            <IoSearchSharp className="tab__icon" size={24} />
            <span className="tab__label">Rechercher</span>
          </li>
          <li
            className={`tab ${currentPage === "Settings" ? "tab--active" : ""}`}
            onClick={() => setCurrentPage("Settings")}
          >
            <IoMdMore className="tab__icon" size={24} />
            <span className="tab__label">Paramètres</span>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Navigation;
