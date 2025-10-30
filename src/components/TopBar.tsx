import { useApp } from "../contexts/AppContext";
import { IoIosArrowBack } from "react-icons/io";

const TopBar = () => {
  const { currentPage, setCurrentPage } = useApp();

  const title = () => {
    switch (currentPage) {
      case "Home":
        return "NavX Recorder";
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

  return (
    <>
      <header className="topbar-container">
        <div className="topbar-left">
          {currentPage !== "Home" && (
            <IoIosArrowBack
              className="topbar-left__button"
              onClick={() => setCurrentPage("Home")}
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
