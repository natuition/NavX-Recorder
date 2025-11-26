import { useContext } from "react";
import type { GeolocationContextType } from "../providers/GeolocationProvider";
import GeolocationContext from "../providers/GeolocationProvider";

// Hook personnalisé pour utiliser le contexte de géolocalisation
export const useGeolocation = (): GeolocationContextType => {
  const ctx = useContext(GeolocationContext);
  if (ctx === undefined) {
    throw new Error("useGeolocation must be used within GeolocationProvider");
  }
  return ctx;
};
