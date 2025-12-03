import { useEffect, type JSX } from "react";
import {
  IoIosAlert,
  IoIosCheckmarkCircle,
  IoIosWarning,
  IoIosInformationCircle,
  IoMdClose,
} from "react-icons/io";
import { useToast } from "../hooks/useToast";
import { useLocation } from "react-router";

type ToastStatus = "success" | "error" | "warn" | "info" | "neutral";
type ToastPosition = "top-left" | "bottom-left";

export type ToastOptions = {
  position?: ToastPosition;
  duration?: number;
};

export type ToastProps = {
  /**
   * Indique si le toast est visible ou non.
   */
  isVisible?: boolean;
  /**
   * Message à afficher dans le toast.
   */
  message?: string | null;
  /**
   * Statut du toast (définit l'icône et le style).
   */
  status?: ToastStatus;
  /**
   * Options supplémentaires du toast.
   */
  options: ToastOptions;
};

const TOAST_ICONS: Record<ToastStatus, JSX.Element> = {
  success: <IoIosCheckmarkCircle className="toast__icon" />,
  error: <IoIosAlert className="toast__icon " />,
  warn: <IoIosWarning className="toast__icon " />,
  info: <IoIosInformationCircle className="toast__icon " />,
  neutral: <IoIosInformationCircle className="toast__icon " />,
};

/**
 * Composant affichant des notifications temporaires (toasts) à l'utilisateur.
 */
const Toast = () => {
  const { isVisible, message, status, hide, options } = useToast();
  const location = useLocation();

  useEffect(() => {
    let timeout: number;
    if (isVisible) {
      timeout = setTimeout(() => {
        hide();
      }, options.duration || 2000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isVisible, hide, options.duration]);

  useEffect(() => {
    // Lorsque la route change, on cache le toast
    hide();
  }, [location.pathname, hide]);

  if (!isVisible) return;

  return (
    <div
      className={`toast toast--${status} ${
        options.position && "toast--" + options.position
      } ${isVisible ? "toast--visible" : ""}`}
    >
      <div className="toast__left">{TOAST_ICONS[status!]}</div>
      <div className="toast__right">
        <p>{message || "Hello world!"}</p>
        <IoMdClose className="toast__close" onClick={hide} />
      </div>
    </div>
  );
};

export default Toast;
