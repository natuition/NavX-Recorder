import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BluetoothProvider } from "./contexts/BluetoothContext.tsx";
import { AppProvider } from "./contexts/AppContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <BluetoothProvider>
        <App />
      </BluetoothProvider>
    </AppProvider>
  </StrictMode>
);
