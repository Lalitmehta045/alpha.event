import { useState, useCallback } from "react";
import { mapboxAddressMapper, LocationData } from "@/utils/mapboxAddressMapper";

export function useReverseGeocode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<LocationData> => {
    setLoading(true);
    setError(null);
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) throw new Error("Mapbox token is missing");

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?country=in&limit=1&access_token=${token}`
      );

      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.features || data.features.length === 0) {
        throw new Error("No address found for this location");
      }

      return mapboxAddressMapper(data.features[0]);
    } catch (err: unknown) {
      console.error("Reverse geocoding error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to reverse geocode";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    reverseGeocode,
  };
}
