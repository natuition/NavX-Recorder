import type { Position } from "geojson";
import { useCallback, useState, useEffect, useRef } from "react";

export const useNavigatorGeolocation = (
  options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  }
) => {
  const [initialLocation, setInitialLocation] = useState<Position | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Position | null>(null);
  const [locationError, setLocationError] = useState<string>("");

  const watchIdRef = useRef<number | null>(null);
  const optionsRef = useRef<PositionOptions>(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const isNavigatorGeolocationSupported = "geolocation" in navigator;

  const handleError = useCallback((error: GeolocationPositionError) => {
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
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (!isNavigatorGeolocationSupported) {
      setLocationError("Géolocalisation non supportée");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPoint: Position = [longitude, latitude];
        console.log("Initial location obtained:", newPoint);
        setInitialLocation(newPoint);
        setCurrentLocation(newPoint);
        setLocationError("");
      },
      handleError,
      optionsRef.current
    );
  }, [isNavigatorGeolocationSupported, handleError]);

  const watchCurrentLocation = useCallback(() => {
    if (!isNavigatorGeolocationSupported) {
      setLocationError("Géolocalisation non supportée");
      return;
    }

    if (watchIdRef.current !== null) {
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPoint: Position = [longitude, latitude];
        console.log("Current location updated:", newPoint);

        setCurrentLocation(newPoint);
        setLocationError("");
      },
      handleError,
      optionsRef.current
    );
  }, [isNavigatorGeolocationSupported, handleError]);

  useEffect(() => {
    if (!initialLocation) {
      getCurrentLocation();
    } else {
      watchCurrentLocation();
      return () => {
        navigator.geolocation.clearWatch(watchIdRef.current!);
      };
    }
  }, [initialLocation, getCurrentLocation, watchCurrentLocation]);

  return {
    currentLocation,
    initialLocation,
    locationError,
    isNavigatorGeolocationSupported,
    getCurrentLocation,
  };
};
