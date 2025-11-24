import { useApp } from "../contexts/AppContext";
import { IoIosArrowBack } from "react-icons/io";
import NavxLogo from "../assets/navx-logo.svg.svg";

const TopBar = () => {
  const { currentPage, currentTool, setCurrentPage, setCurrentTool } = useApp();

  const title = () => {
    switch (currentPage) {
      case "Home":
        return (
          currentTool ?? (
            <img src={NavxLogo} alt="NavX Logo" className="navx-logo" />
          )
        );
      case "Distance":
        return "Mesure de distance";
      case "Surface":
        return "Mesure de surface";
      case "Projects":
        return "Projets";
      case "Search":
        return "Recherche";
      case "Settings":
        return "Paramètres";
    }
  };

  const showBackButton = currentPage !== "Home" || currentTool;

  const handleClickBack = () => {
    if (currentTool) {
      setCurrentTool(null);
    } else {
      setCurrentPage("Home");
    }
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar__left">
          {showBackButton && (
            <IoIosArrowBack
              className="topbar-left__button"
              onClick={handleClickBack}
              size={28}
            />
          )}
          <h1 className="topbar__title">{title()}</h1>
        </div>
        <div className="topbar-right"></div>
      </header>
    </>
  );
};

export default TopBar;
