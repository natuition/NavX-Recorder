import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BluetoothProvider } from "./contexts/BluetoothContext.tsx";
import { BrowserRouter } from "react-router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BluetoothProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </BluetoothProvider>
  </StrictMode>
);
