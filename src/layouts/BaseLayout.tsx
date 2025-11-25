import { useLocation } from "react-router";
import Navigation from "../components/Navigation.tsx";
import TopBar from "../components/TopBar.tsx";

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const showNavigation = !location.pathname.startsWith("/distance");
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
      <div className="safe-area"></div>
    </div>
  );
};

export default BaseLayout;
