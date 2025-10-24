import type { Position } from "geojson";
import { useCallback, useState, useEffect, useRef } from "react";

export const useNavigatorGeolocation = (
  options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  }
) => {
  const [locationError, setLocationError] = useState<string>("");
  const [currentLocation, setCurrentLocation] = useState<Position | null>(null);
  const [hasRequestedInitialLocation, setHasRequestedInitialLocation] =
    useState<boolean>(false);

  const optionsRef = useRef<PositionOptions>(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const isNavigatorGeolocationSupported = "geolocation" in navigator;

  const getCurrentLocation = useCallback(() => {
    if (!isNavigatorGeolocationSupported) {
      setLocationError("Géolocalisation non supportée");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPoint: Position = [longitude, latitude];
        setCurrentLocation(newPoint);
        setLocationError("");
      },
      (error) => {
        let errorMessage = "";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permission de géolocalisation refusée";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Position non disponible";
            break;
          case error.TIMEOUT:
            errorMessage = "Timeout de géolocalisation";
            break;
          default:
            errorMessage = "Erreur de géolocalisation inconnue";
            break;
        }
        setLocationError(errorMessage);
        console.error("Erreur géolocalisation:", errorMessage);
      },
      optionsRef.current
    );
  }, [isNavigatorGeolocationSupported]);

  useEffect(() => {
    if (!hasRequestedInitialLocation) {
      getCurrentLocation();
      setHasRequestedInitialLocation(true);
    }
  }, [hasRequestedInitialLocation, getCurrentLocation]);

  return {
    currentLocation,
    locationError,
    isNavigatorGeolocationSupported,
    getCurrentLocation,
  };
};
