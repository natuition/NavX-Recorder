import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";

import BaseLayout from "./layouts/BaseLayout.tsx";
import Projects from "./pages/Projects.tsx";
import Settings from "./pages/Settings.tsx";
import Search from "./pages/Search.tsx";
import { Route, Routes } from "react-router";
import { MapProvider } from "./providers/MapProvider.tsx";
import Distance from "./pages/Distance.tsx";
import PanelLayout from "./layouts/PanelLayout.tsx";
import { AppProvider } from "./providers/AppProvider.tsx";
import Modal from "./components/Modal.tsx";
import Area from "./pages/Area.tsx";
import Toast from "./components/Toast.tsx";
import { MapLayout } from "./layouts/MapLayout.tsx";
import ProjectDetails from "./pages/ProjectDetails.tsx";

/**
 * Composant principal de l'application NavX Recorder.
 * Il configure la structure de l'application avec les différents
 * fournisseurs de contexte et les routes.
 */
const App = () => {
  return (
    <>
      <AppProvider>
        <Modal />
        <Toast />
        <MapProvider>
          <BaseLayout>
            <Routes>
              <Route path="/" element={<MapLayout />}>
                <Route index element={<p className="loader">Loading...</p>} />
                <Route path="distance" element={<Distance />} />
                <Route path="area" element={<Area />} />
              </Route>
              <Route path="/" element={<PanelLayout />}>
                <Route path="projects" element={<Projects />} />
                <Route path="projects/:id" element={<ProjectDetails />} />
                <Route path="search" element={<Search />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </BaseLayout>
        </MapProvider>
      </AppProvider>
    </>
  );
};

export default App;
