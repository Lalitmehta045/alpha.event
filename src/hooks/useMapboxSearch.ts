import { useState, useCallback, useRef } from "react";
import { mapboxAddressMapper, LocationData, MapboxFeature } from "@/utils/mapboxAddressMapper";

export function useMapboxSearch() {
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchAddress = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) throw new Error("Mapbox token is missing");

      // Request POI and address, increase limit so we can rank and slice the top 5
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=in&limit=10&types=poi,address&access_token=${token}`
      );

      if (!response.ok) {
        throw new Error(`Mapbox API error: ${response.status}`);
      }

      const data = await response.json();
      let features: MapboxFeature[] = data.features || [];

      // Custom ranking
      features.sort((a, b) => {
        const getScore = (feature: MapboxFeature) => {
          let score = 0;
          const placeType = feature.place_type || [];
          const categoryStr = (typeof feature.properties?.category === 'string' ? feature.properties.category : "").toLowerCase();
          const nameStr = (feature.text || "").toLowerCase();

          // 1. POI
          if (placeType.includes("poi")) {
            score += 1000;

            const priorityKeywords = [
              "hotel", "banquet", "resort", "college", "restaurant", 
              "convention center", "marriage garden", "event venue",
              "institute", "university", "academy"
            ];

            // Prioritize custom categories
            const isPriority = priorityKeywords.some(kw => categoryStr.includes(kw) || nameStr.includes(kw));
            if (isPriority) {
              score += 500;
            } else if (categoryStr) {
              // 2. Business
              score += 200;
            } else {
              // 3. Landmark (POI without specific business category)
              score += 100;
            }
          } 
          // 4. Address
          else if (placeType.includes("address")) {
            score += 10;
          }

          // Factor in Mapbox's own relevance as a tie-breaker
          score += (feature.relevance || 0);

          return score;
        };

        return getScore(b) - getScore(a); // Sort descending
      });

      // Keep only top 5 after custom ranking
      setSuggestions(features.slice(0, 5));
    } catch (error) {
      console.error("Address search error:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback((query: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      searchAddress(query);
    }, 500);
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    loading,
    debouncedSearch,
    clearSuggestions,
    searchAddress,
  };
}
