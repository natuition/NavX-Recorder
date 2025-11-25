import { useModal } from "../hooks/useModal";

export type ModalProps = {
  isOpen?: boolean;
  message: string;
  yesLabel?: string | boolean;
  noLabel?: string | boolean;
  onYes?: () => void;
  onNo?: () => void;
};

export const Modal = () => {
  const { isOpen, message, yesLabel, noLabel, close, onYes, onNo } = useModal();

  if (!isOpen) return null;

  return (
    <div className="modal__overlay" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__content">
          <p>{message}</p>
          <div className="modal__actions">
            {yesLabel && (
              <button className="button button--success" onClick={onYes}>
                {typeof yesLabel === "string" ? yesLabel : "Oui"}
              </button>
            )}
            {noLabel && (
              <button className="button button--neutral" onClick={onNo}>
                {typeof noLabel === "string" ? noLabel : "Non"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
