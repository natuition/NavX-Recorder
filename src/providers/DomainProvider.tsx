import { createContext, useMemo, type ReactNode } from "react";
import { ProjectManager } from "../domain/project/ProjectManager";
import { LocalStorageStore } from "../domain/stores/LocalStorageStore";

type DomainStateType = {
  managers: {
    projectManager: ProjectManager;
  };
};

// type DomainActionsType = {};

type DomainContextType = {
  state: DomainStateType;
  // actions: DomainActionsType;
};

type DomainProviderProps = {
  children: ReactNode;
};

const defaultAppContext: DomainContextType = {
  state: {
    managers: {
      projectManager: {} as ProjectManager,
    },
  },
  // actions: {},
};

/**
 * Contexte global pour la gestion du domaine métier de l'application.
 */
const DomainContext = createContext<DomainContextType>(defaultAppContext);

/**
 * Fournit le contexte global du domaine métier aux composants enfants.
 * Voir `DomainContext`.
 */
export const DomainProvider = ({ children }: DomainProviderProps) => {
  /*
  J'utilise memo et pas useRef car le constructeur
  de `ProjectManager` pourrait évoluer en fonction de
  props ou d'autres dépendances à l'avenir.
  */
  const projectManager = useMemo(
    () => new ProjectManager(new LocalStorageStore("projects_")),
    []
  );

  const state: DomainStateType = {
    managers: {
      projectManager,
    },
  };

  return (
    <DomainContext.Provider value={{ state }}>
      {children}
    </DomainContext.Provider>
  );
};
export default DomainContext;
