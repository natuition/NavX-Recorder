import { IoIosArrowBack } from "react-icons/io";
import NavxLogo from "../assets/navx-logo.svg.svg";
import { useLocation, useNavigate } from "react-router";
import { capitalize } from "../utils/string";
import { useModal } from "../hooks/useModal";

const TopBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const modal = useModal();

  const showBackButton =
    location.pathname.startsWith("/distance") ||
    location.pathname.startsWith("/area");
  const title =
    location.state?.title ?? capitalize(location.pathname.split("/")[1]); // Fallback title

  const handleBack = () => {
    if (location.state?.measureActive) {
      console.debug("Open modal to confirm discard measurement");
      modal.open({
        message:
          "Vous avez une mesure en cours. Voulez-vous vraiment quitter cette page et perdre la mesure en cours ?",
        yesLabel: "Oui, quitter",
        noLabel: "Non, rester",
        onYes: () => {
          modal.close();
          navigate("/");
        },
        onNo: () => {
          modal.close();
        },
      });
    } else {
      navigate("/");
    }
  };

  return (
    <div className="topbar">
      <div className="topbar__left">
        {showBackButton ? (
          <>
            <IoIosArrowBack
              onClick={handleBack}
              className="topbar-left__back"
              size={24}
            />

            <h1 className="topbar__title">{title}</h1>
          </>
        ) : (
          <img className="topbar__logo" src={NavxLogo} alt="NavX Logo" />
        )}
      </div>
      <div className="topbar-right"></div>
    </div>
  );
};

export default TopBar;
