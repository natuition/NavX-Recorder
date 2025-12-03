import { useCallback, useContext } from "react";
import AppContext from "../providers/AppProvider";
import type { ToastOptions } from "../components/Toast";

const DEFAULT_TOAST_OPTIONS: ToastOptions = {
  position: "top-left",
  duration: 2000,
};

export function useToast() {
  const { state, actions } = useContext(AppContext);

  const info = useCallback((message: string, options: ToastOptions = DEFAULT_TOAST_OPTIONS) => {
    actions.toast.show({
      message: message,
      status: "info",
      options: Object.assign({}, DEFAULT_TOAST_OPTIONS, options),
    })
  }, [actions.toast]);

  const warn = useCallback((message: string, options: ToastOptions = DEFAULT_TOAST_OPTIONS) => {
    actions.toast.show({
      message: message,
      status: "warn",
      options: Object.assign({}, DEFAULT_TOAST_OPTIONS, options),

    })
  }, [actions.toast]);

  const error = useCallback((message: string, options: ToastOptions = DEFAULT_TOAST_OPTIONS) => {
    actions.toast.show({
      message: message,
      status: "error",
      options: Object.assign({}, DEFAULT_TOAST_OPTIONS, options),
    })
  }, [actions.toast]);

  const success = useCallback((message: string, options: ToastOptions = DEFAULT_TOAST_OPTIONS) => {
    actions.toast.show({
      message: message,
      status: "success",
      options: Object.assign({}, DEFAULT_TOAST_OPTIONS, options),
    })
  }, [actions.toast]);

  return {
    ...state.toast,
    hide: actions.toast.hide,
    info, error, warn, success
  };
}
