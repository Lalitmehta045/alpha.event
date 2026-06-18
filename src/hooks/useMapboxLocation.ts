import { useState, useCallback } from "react";
import { useLocationReverse } from "./useLocationReverse";
import { LocationData } from "@/utils/mapboxAddressMapper";

export function useMapboxLocation() {
  const [detecting, setDetecting] = useState(false);
  const { reverseGeocode, error: reverseError } = useLocationReverse();

  const detectLocation = useCallback(async (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      setDetecting(true);

      const onSuccess = async (position: GeolocationPosition) => {
        try {
          const { latitude, longitude } = position.coords;
          const locationData = await reverseGeocode(latitude, longitude);
          resolve(locationData);
        } catch (error) {
          reject(error);
        } finally {
          setDetecting(false);
        }
      };

      const onError = (error: GeolocationPositionError) => {
        setDetecting(false);
        let message = "Failed to detect location";
        if (error.code === 1) message = "Location permission denied";
        if (error.code === 2) message = "Location unavailable";
        if (error.code === 3) message = "Location request timed out";
        reject(new Error(message));
      };

      navigator.geolocation.getCurrentPosition(
        onSuccess,
        (error) => {
          console.warn("High accuracy failed, trying low accuracy:", error);
          navigator.geolocation.getCurrentPosition(
            onSuccess,
            onError,
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
          );
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
      );
    });
  }, [reverseGeocode]);

  return {
    detecting,
    error: reverseError,
    detectLocation,
  };
}
