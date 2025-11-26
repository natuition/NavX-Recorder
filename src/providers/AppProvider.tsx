import { createContext, useReducer, type ReactNode } from "react";
import { type ModalProps } from "../components/Modal";
import type { ToastProps } from "../components/Toast";

type AppStateType = {
  modal: ModalProps;
  toast: ToastProps;
};

type AppActionsType = {
  modal: {
    open: (props: ModalProps) => void;
    close: () => void;
  };
  toast: {
    show: (props: ToastProps) => void;
    hide: () => void;
  };
};

type AppContextType = {
  state: AppStateType;
  actions: AppActionsType;
};

type AppProviderProps = {
  children: ReactNode;
};

const defaultAppContext: AppContextType = {
  state: {
    modal: { isOpen: false, message: "" },
    toast: { isVisible: false, message: "", status: "neutral" },
  },
  actions: {
    modal: {
      open: () => {},
      close: () => {},
    },
    toast: {
      show: () => {},
      hide: () => {},
    },
  },
};

/**
 * Contexte global de l'application pour la gestion des composants à
 * état global (modal, toast, etc.).
 */
const AppContext = createContext<AppContextType>(defaultAppContext);

/**
 * Fournit le contexte global de l'application aux composants enfants.
 * Voir `AppContext`.
 */
export const AppProvider = ({ children }: AppProviderProps) => {
  const [state, dispatch] = useReducer(
    (state: AppStateType, action: { type: string; payload?: object }) => {
      switch (action.type) {
        case "MODAL_OPEN":
          return {
            ...state,
            modal: { ...state.modal, ...action.payload, isOpen: true },
          };
        case "MODAL_CLOSE":
          return {
            ...state,
            modal: {
              message: null,
              isOpen: false,
              yesLabel: false,
              noLabel: false,
              onNo: () => null,
              onYes: () => null,
              _render: () => null,
            },
          };
        case "TOAST_SHOW":
          return {
            ...state,
            toast: { ...state.toast, ...action.payload, isVisible: true },
          };
        case "TOAST_HIDE":
          return { ...state, toast: { ...state.toast, isVisible: false } };
        default:
          return state;
      }
    },
    defaultAppContext.state
  );

  const actions: AppActionsType = {
    modal: {
      open: (props: ModalProps) =>
        dispatch({ type: "MODAL_OPEN", payload: props }),
      close: () => dispatch({ type: "MODAL_CLOSE" }),
    },
    toast: {
      show: (props: ToastProps) =>
        dispatch({ type: "TOAST_SHOW", payload: props }),
      hide: () => dispatch({ type: "TOAST_HIDE" }),
    },
  };

  return (
    <AppContext.Provider
      value={{
        state,
        actions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
export default AppContext;
