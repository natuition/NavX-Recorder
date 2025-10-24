import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BluetoothProvider } from "./contexts/BluetoothContext.tsx";

createRoot(document.getElementById("root")!).render(
  <BluetoothProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </BluetoothProvider>
);
