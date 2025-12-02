import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BluetoothProvider } from "./providers/BluetoothProvider.tsx";
import { BrowserRouter } from "react-router";
import { GeolocationProvider } from "./providers/GeolocationProvider.tsx";

/**
 * Point d'entrée principal de l'application.
 * Il encapsule l'application dans les fournisseurs de contexte nécessaires
 * et le routeur.
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BluetoothProvider>
      <GeolocationProvider>
        <BrowserRouter basename={import.meta.env.VITE_BASE_URL}>
          <App />
        </BrowserRouter>
      </GeolocationProvider>
    </BluetoothProvider>
  </StrictMode>
);
