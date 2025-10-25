import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

// Types pour le state du contexte
interface AppState {
  // Ajoutez vos propriétés ici
  isLoading: boolean;
  isActionMenuOpen: boolean;
}

// Types pour les actions du contexte
interface AppContextType {
  state: AppState;
  setLoading: (loading: boolean) => void;
  toggleActionMenu: () => void;
}

// State initial
const initialState: AppState = {
  isLoading: false,
  isActionMenuOpen: false,
};

// Création du contexte
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>(initialState);

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  };

  const toggleActionMenu = () => {
    setState((prev) => ({
      ...prev,
      isActionMenuOpen: !prev.isActionMenuOpen,
    }));
  };

  const value: AppContextType = {
    state,
    setLoading,
    toggleActionMenu,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
