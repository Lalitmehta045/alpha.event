import { useState, useCallback } from "react";
import { geoapifyMapper } from "@/utils/geoapifyMapper";
import { LocationData } from "@/utils/mapboxAddressMapper"; // import common schema

export function useGeoapifyReverse() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<LocationData> => {
    setLoading(true);
    setError(null);
    try {
      const token = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
      if (!token) throw new Error("Geoapify token is missing");

      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${token}`
      );

      if (!response.ok) {
        throw new Error(`Geoapify API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.features || data.features.length === 0) {
        throw new Error("No address found for this location");
      }

      return geoapifyMapper(data.features[0]);
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
