import { useContext } from "react";
import DomainContext from "../providers/DomainProvider";

export const useProjectManager = () => {
  const { state } = useContext(DomainContext);
  if (!state) {
    throw new Error("useProjectManager must be used within a DomainProvider");
  }
  return state.managers.projectManager;
}
