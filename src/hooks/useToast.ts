import { useContext } from "react";
import AppContext from "../providers/AppProvider";
import type { ToastOptions } from "../components/Toast";

export function useToast() {
  const { state, actions } = useContext(AppContext);

  const info = (message: string, options: ToastOptions = {
    context: "base",
  }) => {
    actions.toast.show({
      message: message,
      status: "info",
      options: options,
    })
  }

  const warn = (message: string, options: ToastOptions = {
    context: "base",
  }) => {
    actions.toast.show({
      message: message,
      status: "warn",
      options: options,

    })
  }

  const error = (message: string, options: ToastOptions = {
    context: "base",
  }) => {
    actions.toast.show({
      message: message,
      status: "error",
      options: options,
    })
  }

  const success = (message: string, options: ToastOptions = {
    context: "base",
  }) => {
    actions.toast.show({
      message: message,
      status: "success",
      options: options,
    })
  }

  return {
    ...state.toast,
    hide: actions.toast.hide,
    info, error, warn, success
  };
}
