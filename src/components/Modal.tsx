import { IoMdClose } from "react-icons/io";
import { IoAlertCircleOutline } from "react-icons/io5";

type ModalProps = {
  status: "info" | "warning" | "error";
  message: string;
  yesNo?: boolean;
  yesLabel?: string;
  noLabel?: string;
  isOpen: boolean;
  onClose: () => void;
  onYes?: () => void;
  onNo?: () => void;
};

const StatusMap: Record<string, string> = {
  info: "Information",
  warning: "Avertissement",
  error: "Erreur",
};

export const Modal = ({
  isOpen,
  yesLabel = "Oui",
  noLabel = "Non",
  status,
  message,
  onYes,
  onNo,
  onClose,
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal__overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h2 className={`modal__status modal__status--${status}`}>
            <IoAlertCircleOutline size={24} />
            <span>{StatusMap[status]}</span>
          </h2>
          <IoMdClose className="modal__close" onClick={onClose} size={18} />
        </header>

        <div className="modal__content">
          <p>{message}</p>

          <div className="modal__actions">
            <button className="button button--primary" onClick={onYes}>
              {yesLabel}
            </button>
            <button className="button button--danger" onClick={onNo}>
              {noLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
