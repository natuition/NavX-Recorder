import { IoIosArrowBack } from "react-icons/io";
import NavxLogo from "../assets/navx-logo.svg.svg";
import { useLocation, useNavigate } from "react-router";
import { useModal } from "../hooks/useModal";

export type TopBarProps = {
  title: string;
  showBackButton: boolean;
};

/**
 * Barre supérieure de l'application affichant le logo ou le
 * bouton de retour selon la route.
 */
const TopBar = ({ title, showBackButton }: TopBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const modal = useModal();

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
          navigate(-1);
        },
        onNo: () => {
          modal.close();
        },
      });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="topbar">
      <div className="topbar__left">
        {showBackButton && (
          <IoIosArrowBack
            onClick={handleBack}
            className="topbar-left__back"
            size={24}
          />
        )}
        {title ? (
          <h1 className="topbar__title">{title}</h1>
        ) : (
          <img className="topbar__logo" src={NavxLogo} alt="NavX Logo" />
        )}
      </div>
      <div className="topbar-right"></div>
    </div>
  );
};

export default TopBar;
