import { useEffect, type JSX } from "react";
import {
  IoIosAlert,
  IoIosCheckmarkCircle,
  IoIosWarning,
  IoIosInformationCircle,
  IoMdClose,
} from "react-icons/io";
import { useToast } from "../hooks/useToast";

type ToastStatus = "success" | "error" | "warn" | "info" | "neutral";

export type ToastProps = {
  isVisible?: boolean;
  message?: string;
  status?: ToastStatus;
};

const TOAST_ICONS: Record<ToastStatus, JSX.Element> = {
  success: <IoIosCheckmarkCircle className="toast__icon" />,
  error: <IoIosAlert className="toast__icon " />,
  warn: <IoIosWarning className="toast__icon " />,
  info: <IoIosInformationCircle className="toast__icon " />,
  neutral: <IoIosInformationCircle className="toast__icon " />,
};

const Toast = () => {
  const { isVisible, message, status, hide } = useToast();

  useEffect(() => {
    let timeout: number;
    if (isVisible) {
      timeout = setTimeout(() => {
        hide();
      }, 3000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isVisible, hide]);

  if (!isVisible) return;

  return (
    <div className={`toast toast--${status}`}>
      <div className="toast__left">{TOAST_ICONS[status!]}</div>
      <div className="toast__right">
        <p>{message}</p>
        <IoMdClose className="toast__close" onClick={hide} />
      </div>
    </div>
  );
};

export default Toast;
