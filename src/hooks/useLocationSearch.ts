import { useMapboxSearch } from "./useMapboxSearch";
import { useGeoapifySearch } from "./useGeoapifySearch";
import { mapboxAddressMapper } from "@/utils/mapboxAddressMapper";
import { geoapifyMapper } from "@/utils/geoapifyMapper";

export function useLocationSearch() {
  const provider = process.env.NEXT_PUBLIC_SEARCH_PROVIDER || "mapbox";
  
  const mapbox = useMapboxSearch();
  const geoapify = useGeoapifySearch();

  if (provider === "geoapify") {
    return {
      suggestions: geoapify.suggestions,
      loading: geoapify.loading,
      debouncedSearch: geoapify.debouncedSearch,
      clearSuggestions: geoapify.clearSuggestions,
      searchAddress: geoapify.searchAddress,
      mapSuggestionToLocation: geoapifyMapper,
      // Helper for UI to render list items generically
      getSuggestionText: (s: any) => s.properties?.name || s.properties?.address_line1 || s.properties?.formatted.split(',')[0] || "Unknown",
      getSuggestionSubtext: (s: any) => s.properties?.formatted || "",
      getSuggestionId: (s: any, index: number) => `geo-${index}`
    };
  }

  return {
    suggestions: mapbox.suggestions,
    loading: mapbox.loading,
    debouncedSearch: mapbox.debouncedSearch,
    clearSuggestions: mapbox.clearSuggestions,
    searchAddress: mapbox.searchAddress,
    mapSuggestionToLocation: mapboxAddressMapper,
    // Helper for UI to render list items generically
    getSuggestionText: (s: any) => s.text,
    getSuggestionSubtext: (s: any) => s.place_name,
    getSuggestionId: (s: any, index: number) => `map-${s.id}-${index}`
  };
}
