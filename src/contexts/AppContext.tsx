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

export type AppToolType = "Distance" | "Surface" | null;

// Types pour le state du contexte
interface AppState {
  currentPage: AppPageType;
  currentTool: AppToolType;
  isActionMenuOpen: boolean;
}

// Types pour les actions du contexte
interface AppContextType extends AppState {
  setCurrentTool: (tool: AppToolType) => void;
  setCurrentPage: (page: AppPageType) => void;
}

// State initial
const initialState: AppState = {
  currentPage: "Home",
  currentTool: null,
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

  const setCurrentTool = (tool: AppToolType) => {
    setState((prev) => ({ ...prev, currentTool: tool }));
  };

  const value: AppContextType = {
    ...state,
    setCurrentPage,
    setCurrentTool,
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
