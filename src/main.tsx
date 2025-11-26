import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BluetoothProvider } from "./contexts/BluetoothContext.tsx";
import { BrowserRouter } from "react-router";
import { GeolocationProvider } from "./contexts/GeolocationContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BluetoothProvider>
      <GeolocationProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GeolocationProvider>
    </BluetoothProvider>
  </StrictMode>
);
