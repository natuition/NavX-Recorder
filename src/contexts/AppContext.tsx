import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type AppPageType =
  | "Home"
  | "Projects"
  | "Distance"
  | "Surface"
  | "Search"
  | "Settings";

// Types pour le state du contexte
interface AppState {
  currentPage: AppPageType;
  isLoading: boolean;
  isActionMenuOpen: boolean;
}

// Types pour les actions du contexte
interface AppContextType extends AppState {
  setCurrentPage: (page: AppPageType) => void;
  setLoading: (loading: boolean) => void;
}

// State initial
const initialState: AppState = {
  currentPage: "Home",
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

  const setCurrentPage = (page: AppPageType) => {
    setState((prev) => ({ ...prev, currentPage: page }));
  };

  const value: AppContextType = {
    ...state,
    setLoading,
    setCurrentPage,
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
