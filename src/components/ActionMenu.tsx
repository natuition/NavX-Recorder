import { FaDrawPolygon, FaRuler } from "react-icons/fa";
import { Link } from "react-router";

type ActionMenuProps = {
  active: boolean;
  onHide: () => void;
};

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
            <FaRuler className="button__icon-left" size={24} />
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
            <FaDrawPolygon className="button__icon-left" size={24} />
            Surface
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default ActionMenu;
