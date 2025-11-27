import { useLocation } from "react-router";
import Navigation from "../components/Navigation.tsx";
import TopBar from "../components/TopBar.tsx";
import { type ReactNode } from "react";
import { useTopBar } from "../hooks/useTopBar.ts";

const ROUTES_WITH_NAVIGATION = ["/", "/projects", "/search", "/settings"];

/**
 * Layout de base englobant l'application avec la top bar et la navigation.
 */
const BaseLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const topBar = useTopBar();

  const showNavigation = ROUTES_WITH_NAVIGATION.includes(location.pathname);

  return (
    <div className="base-layout">
      <header className="base-layout__header">
        <TopBar title={topBar.title} showBackButton={topBar.showBackButton} />
      </header>
      <main className="base-layout__content">{children}</main>
      {showNavigation && (
        <footer className="base-layout__footer">
          <Navigation />
        </footer>
      )}
    </div>
  );
};

export default BaseLayout;
