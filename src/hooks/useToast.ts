import { useContext } from "react";
import AppContext from "../contexts/AppContext";

export function useToast() {
  const { state, actions } = useContext(AppContext);

  return {
    ...state.toast,
    ...actions.toast
  };
}
