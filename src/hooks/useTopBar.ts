import { useContext } from "react";
import AppContext from "../providers/AppProvider";

export function useTopBar() {
  const { state } = useContext(AppContext);

  return {
    ...state.topBar
  };
}
