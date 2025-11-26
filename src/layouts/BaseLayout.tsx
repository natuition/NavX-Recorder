import { useLocation } from "react-router";
import Navigation from "../components/Navigation.tsx";
import TopBar from "../components/TopBar.tsx";
import { type ReactNode } from "react";

const ROUTES_WHITHOUT_NAVIGATION = ["/distance", "/area"];

/**
 * Layout de base englobant l'application avec la top bar et la navigation.
 */
const BaseLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  const showNavigation = !ROUTES_WHITHOUT_NAVIGATION.includes(
    location.pathname
  );

  return (
    <div className="base-layout">
      <header className="base-layout__header">
        <TopBar />
      </header>
      <main className="base-layout__content">{children}</main>
      {showNavigation && (
        <footer className="base-layout__footer">
          <Navigation />
        </footer>
      )}
      {/* <div className="safe-area"></div> */}
    </div>
  );
};

export default BaseLayout;
