import { IoMap, IoFolderOpen, IoSearchSharp } from "react-icons/io5";
import { IoMdMore } from "react-icons/io";
import { useState } from "react";
import TabButton from "./TabButton";
import ActionMenu from "./ActionMenu";
import { NavLink } from "react-router";

const Navigation = () => {
  const [isMenuVisible, setIsMenuVisible] = useState<boolean>(false);

  return (
    <>
      <ActionMenu
        active={isMenuVisible}
        onHide={() => setIsMenuVisible(false)}
      />
      <nav className="navigation">
        <ul className="navigation__tabs">
          <NavLink to="/" className="tab">
            <IoMap className="tab__icon" size={24} />
            <span className="tab__label">Carte</span>
          </NavLink>
          <NavLink to="/projects" className="tab">
            <IoFolderOpen className="tab__icon" size={24} />
            <span className="tab__label">Projets</span>
          </NavLink>
          <TabButton onPress={() => setIsMenuVisible(true)} />
          <NavLink to="/search" className="tab">
            <IoSearchSharp className="tab__icon" size={24} />
            <span className="tab__label">Rechercher</span>
          </NavLink>
          <NavLink to="/settings" className="tab">
            <IoMdMore className="tab__icon" size={24} />
            <span className="tab__label">Paramètres</span>
          </NavLink>
        </ul>
      </nav>
    </>
  );
};

export default Navigation;
