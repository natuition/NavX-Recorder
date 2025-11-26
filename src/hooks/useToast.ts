import { useContext } from "react";
import AppContext from "../providers/AppProvider";

export function useToast() {
  const { state, actions } = useContext(AppContext);

  const info = (message: string) => {
    actions.toast.show({
      message: message,
      status: "info",
    })
  }

  const warn = (message: string) => {
    actions.toast.show({
      message: message,
      status: "warn",
    })
  }

  const error = (message: string) => {
    actions.toast.show({
      message: message,
      status: "error",
    })
  }

  const success = (message: string) => {
    actions.toast.show({
      message: message,
      status: "success",
    })
  }

  return {
    ...state.toast,
    hide: actions.toast.hide,
    info, error, warn, success
  };
}
