import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";

import BaseLayout from "./layouts/BaseLayout.tsx";
import Projects from "./pages/Projects.tsx";
import Settings from "./pages/Settings.tsx";
import Search from "./pages/Search.tsx";
import { Route, Routes } from "react-router";
import { MapLayout } from "./layouts/MapLayout.tsx";
import Distance from "./pages/Distance.tsx";
import PanelLayout from "./layouts/PanelLayout.tsx";
import { AppProvider } from "./contexts/AppContext.tsx";
import Modal from "./components/Modal.tsx";
import Area from "./pages/Area.tsx";
import Toast from "./components/Toast.tsx";

const App = () => {
  return (
    <>
      <AppProvider>
        <Modal />
        <Toast />
        <BaseLayout>
          <Routes>
            <Route path="/" element={<MapLayout />}>
              <Route index element={<p>Map loader</p>} />
              <Route path="distance" element={<Distance />} />
              <Route path="area" element={<Area />} />
            </Route>
            <Route path="/" element={<PanelLayout />}>
              <Route path="projects" element={<Projects />} />
              <Route path="search" element={<Search />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BaseLayout>
      </AppProvider>
    </>
  );
};

export default App;
