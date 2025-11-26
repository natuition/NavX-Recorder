import { useContext } from "react";
import AppContext from "../providers/AppProvider";

export function useToast() {
  const { state, actions } = useContext(AppContext);

  return {
    ...state.toast,
    ...actions.toast
  };
}
