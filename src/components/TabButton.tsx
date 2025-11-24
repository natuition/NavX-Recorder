import type { MouseEventHandler } from "react";
import { IoAddCircle } from "react-icons/io5";

const TabButton = ({
  onPress,
}: {
  onPress?: MouseEventHandler<HTMLLIElement>;
}) => {
  return (
    <li onClick={onPress} className="tab tab--button">
      <IoAddCircle size={40} />
    </li>
  );
};

export default TabButton;
