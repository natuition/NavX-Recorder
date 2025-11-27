import type { MouseEventHandler } from "react";
import { FaTools } from "react-icons/fa";

const TabButton = ({
  onPress,
}: {
  onPress?: MouseEventHandler<HTMLLIElement>;
}) => {
  return (
    <li onClick={onPress} className="tab tab--button">
      <FaTools size={24} />
    </li>
  );
};

export default TabButton;
