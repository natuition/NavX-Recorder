import { useState, type MouseEvent } from "react";
import { IoMdMore } from "react-icons/io";

export type DropdownOption = {
  label: string;
  status: "default" | "danger";
  action: () => void;
};

type DropdownProps = {
  options: DropdownOption[];
};

const Dropdown = ({ options }: DropdownProps) => {
  const [active, setActive] = useState(false);

  const handleToggle = (e: MouseEvent) => {
    e.stopPropagation();
    setActive(!active);
  };

  const handleClose = (e: MouseEvent) => {
    e.stopPropagation();
    setActive(false);
  };

  return (
    <>
      {active && <div onClick={handleClose} className="dropdown-overlay" />}
      <div className="dropdown">
        <IoMdMore className="dropdown-toggle" onClick={handleToggle} />
        <ul
          className={`dropdown-menu ${active ? "dropdown-menu--active" : ""}`}
        >
          {options?.map((option, index) => (
            <li
              key={index}
              className={`dropdown-item dropdown-item--${option.status}`}
              onClick={(e) => {
                e.stopPropagation();
                option.action();
                setActive(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};
export default Dropdown;
