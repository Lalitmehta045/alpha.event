import { useReverseGeocode as useMapboxReverse } from "./useReverseGeocode";
import { useGeoapifyReverse } from "./useGeoapifyReverse";

export function useLocationReverse() {
  const provider = process.env.NEXT_PUBLIC_SEARCH_PROVIDER || "mapbox";
  
  const mapbox = useMapboxReverse();
  const geoapify = useGeoapifyReverse();

  if (provider === "geoapify") {
    return geoapify;
  }

  return mapbox;
}
