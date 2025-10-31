import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";

import BaseLayout from "./layouts/BaseLayout.tsx";
import { useApp } from "./contexts/AppContext.tsx";
import Home from "./pages/Home.tsx";
import Projects from "./pages/Projects.tsx";
import Settings from "./pages/Settings.tsx";
import Search from "./pages/Search.tsx";
import Tabs from "./components/Tabs.tsx";

const App = () => {
  const { currentPage, currentTool } = useApp();

  return (
    <>
      <BaseLayout>
        {currentPage === "Home" && <Home />}
        {currentPage === "Projects" && <Projects />}
        {currentPage === "Search" && <Search />}
        {currentPage === "Settings" && <Settings />}
        {currentPage === "Home" && !currentTool && <Tabs />}
      </BaseLayout>
    </>
  );
};

export default App;
