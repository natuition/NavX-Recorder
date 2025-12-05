import { PiPolygonFill } from "react-icons/pi";
import { SiAlwaysdata } from "react-icons/si";

import { Link } from "react-router";

type ActionMenuProps = {
  /**
   * Indique si le menu est actif (visible) ou non.
   */
  active: boolean;
  /**
   * Callback appelé lorsque l'utilisateur clique en dehors du menu pour le fermer.
   * @returns void
   */
  onHide: () => void;
};

/**
 * Ce composant affiche un menu d'action permettant de choisir entre
 * différentes options de mesure (distance ou surface).
 */
const ActionMenu = ({ onHide, active }: ActionMenuProps) => {
  return (
    <nav
      onClick={onHide}
      className={`action-menu__overlay ${active ? "" : "invisible"}`}
    >
      <ul className="action-menu">
        <li className="action-menu__item">
          <Link
            state={{
              measureActive: false,
              mode: "distance",
              title: "Distance",
            }}
            className="button button--neutral"
            to="/distance"
          >
            <SiAlwaysdata className="button__icon-left" size={24} />
            Distance
          </Link>
        </li>
        <li className="action-menu__item">
          <Link
            state={{
              measureActive: false,
              mode: "area",
              title: "Surface",
            }}
            to="/area"
            className="button button--neutral"
          >
            <PiPolygonFill className="button__icon-left" size={24} />
            Surface
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default ActionMenu;
