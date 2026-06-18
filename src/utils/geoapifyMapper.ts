import { LocationData } from "@/utils/mapboxAddressMapper";

export interface GeoapifyFeature {
  type: string;
  properties: {
    country?: string;
    state?: string;
    county?: string;
    city?: string;
    postcode?: string;
    suburb?: string;
    street?: string;
    housenumber?: string;
    lon: number;
    lat: number;
    formatted: string;
    address_line1?: string;
    address_line2?: string;
    name?: string;
    category?: string;
    result_type?: string; // "poi", "street", "building", etc.
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

/**
 * Maps a Geoapify Geocoding feature to the application's exact LocationData schema.
 * This ensures no database fields or API contracts are modified.
 */
export const geoapifyMapper = (feature: GeoapifyFeature): LocationData => {
  const props = feature.properties;

  let city = props.city || props.county || "";
  let state = props.state || "";
  let pincode = props.postcode || "";
  let country = props.country || "India";

  // Construct a clean address line
  // If it's a POI with a name, use the name, otherwise use address_line1
  let addressLine = props.name || props.address_line1 || props.formatted.split(',')[0];

  return {
    address: addressLine,
    city: city || "",
    state: state || "",
    pincode: pincode || "",
    country: country || "India",
    latitude: props.lat,
    longitude: props.lon,
  };
};
