import { IoMap, IoFolderOpen, IoSearchSharp } from "react-icons/io5";
import { IoMdMore } from "react-icons/io";
import { useState } from "react";
import TabsButton from "./TabsButton";
import { useApp } from "../contexts/AppContext";

const TABS = {
  MAP: "map",
  PROJECTS: "projects",
  SEARCH: "search",
  SETTINGS: "settings",
};

const Tabs = () => {
  const [activeTab, setActiveTab] = useState<string>("map");

  const { toggleActionMenu } = useApp();

  return (
    <nav className="tabs-container">
      <ul className="tabs">
        <li
          className={`tab ${activeTab === TABS.MAP ? "tab--active" : ""}`}
          onClick={() => setActiveTab(TABS.MAP)}
        >
          <IoMap size={24} />
          <span className="tab__label">Carte</span>
        </li>
        <li
          className={`tab ${activeTab === TABS.PROJECTS ? "tab--active" : ""}`}
          onClick={() => setActiveTab(TABS.PROJECTS)}
        >
          <IoFolderOpen size={24} />
          <span className="tab__label">Projets</span>
        </li>
        <TabsButton onPress={() => toggleActionMenu()} />
        <li
          className={`tab ${activeTab === TABS.SEARCH ? "tab--active" : ""}`}
          onClick={() => setActiveTab(TABS.SEARCH)}
        >
          <IoSearchSharp size={24} />
          <span className="tab__label">Rechercher</span>
        </li>
        <li
          className={`tab ${activeTab === TABS.SETTINGS ? "tab--active" : ""}`}
          onClick={() => setActiveTab(TABS.SETTINGS)}
        >
          <IoMdMore size={24} />
          <span className="tab__label">Paramètres</span>
        </li>
      </ul>
    </nav>
  );
};

export default Tabs;
