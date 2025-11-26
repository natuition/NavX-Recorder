import { useContext } from "react";
import AppContext from "../providers/AppProvider";

export function useModal() {
  const { state, actions } = useContext(AppContext);

  return {
    ...state.modal,
    ...actions.modal
  };
}
