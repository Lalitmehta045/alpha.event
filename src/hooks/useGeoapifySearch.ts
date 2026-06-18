import { useState, useCallback, useRef } from "react";
import { geoapifyMapper, GeoapifyFeature } from "@/utils/geoapifyMapper";

export function useGeoapifySearch() {
  const [suggestions, setSuggestions] = useState<GeoapifyFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchAddress = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const token = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
      if (!token) throw new Error("Geoapify token is missing");

      // We request a larger limit so we can sort and slice top 10
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&limit=20&filter=countrycode:in&apiKey=${token}`
      );

      if (!response.ok) {
        throw new Error(`Geoapify API error: ${response.status}`);
      }

      const data = await response.json();
      let features: GeoapifyFeature[] = data.features || [];

      // Custom ranking
      features.sort((a, b) => {
        const getScore = (feature: GeoapifyFeature) => {
          let score = 0;
          const props = feature.properties;
          const resultType = props.result_type || "";
          const nameStr = (props.name || "").toLowerCase();
          const categories = (props.category || "").toLowerCase();

          // 1. POI Match
          if (resultType === "amenity" || resultType === "poi" || resultType === "building") {
            score += 1000;

            const priorityKeywords = [
              "hotel", "banquet", "resort", "college", "restaurant", 
              "convention center", "marriage garden", "event venue",
              "institute", "university", "academy", "hospital", "mall"
            ];

            const isPriority = priorityKeywords.some(kw => categories.includes(kw) || nameStr.includes(kw));
            if (isPriority) {
              score += 500; // Exact POI match / venue match
            } else if (categories) {
              // 2. Business
              score += 200;
            } else {
              // 3. Landmark
              score += 100;
            }
          } else if (resultType === "street" || resultType === "postcode" || resultType === "city" || resultType === "suburb") {
            // 5. Address Match
            score += 10;
          }

          // Include Geoapify rank as tiebreaker (smaller rank object values are better in Geoapify typically, but we will ignore it for now)
          return score;
        };

        return getScore(b) - getScore(a); // Sort descending
      });

      // Keep top 10 as per requirements
      setSuggestions(features.slice(0, 10));
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
