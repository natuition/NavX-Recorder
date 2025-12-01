import { type ReactNode } from "react";
import { useModal } from "../hooks/useModal";

export type ModalProps = {
  /**
   * Indique si la modal est ouverte ou non.
   */
  isOpen?: boolean;
  /**
   * Message à afficher dans la modal.
   */
  message?: string | null;
  /**
   * Label du bouton "Oui" (ou true pour afficher le bouton par défaut).
   */
  yesLabel?: string | boolean;
  /**
   * Label du bouton "Non" (ou true pour afficher le bouton par défaut).
   */
  noLabel?: string | boolean;
  /**
   * Callback appelé lorsque l'utilisateur clique sur "Oui".
   */
  onYes?: () => void;
  /**
   * Callback appelé lorsque l'utilisateur clique sur "Non".
   */
  onNo?: () => void;
  /**
   * Experimental, permet de rendre un contenu personnalisé dans la modal.
   */
  _render?: () => ReactNode;
};

/**
 * Permet d'afficher des messages et des actions de confirmation.
 * Ce composant est contrôlé via le hook `useModal`.
 */
const Modal = () => {
  const { isOpen, message, yesLabel, noLabel, close, onYes, onNo, _render } =
    useModal();

  if (!isOpen) return null;

  return (
    <div className="modal__overlay" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__content">
          {_render?.() || <p>{message ?? "Hello world!"}</p>}
          <div className="modal__actions">
            {yesLabel && (
              <button className="button button--primary" onClick={onYes}>
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

const SaveDistanceContent = ({ distance }: { distance: number }) => {
  return (
    <>
      <p>Distance à enregistrer: {distance}</p>
    </>
  );
};

Modal.SaveDistance = SaveDistanceContent;

export default Modal;
