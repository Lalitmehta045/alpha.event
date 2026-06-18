export interface LocationData {
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface MapboxFeature {
  id: string;
  type: string;
  place_type: string[];
  relevance?: number;
  properties?: Record<string, unknown>;
  text: string;
  place_name: string;
  center?: [number, number]; // [lon, lat]
  geometry?: {
    type: string;
    coordinates: [number, number]; // [lon, lat]
  };
  context?: {
    id: string;
    text: string;
    short_code?: string;
  }[];
}

/**
 * Maps a Mapbox Geocoding feature to the application's exact LocationData schema.
 * This ensures no database fields or API contracts are modified.
 */
export const mapboxAddressMapper = (feature: MapboxFeature): LocationData => {
  let city = "";
  let state = "";
  let pincode = "";
  let country = "";

  // Extract from context array
  if (feature.context) {
    for (const ctx of feature.context) {
      if (ctx.id.startsWith("place") || ctx.id.startsWith("locality")) {
        city = ctx.text;
      }
      if (ctx.id.startsWith("region")) {
        state = ctx.text;
      }
      if (ctx.id.startsWith("postcode")) {
        pincode = ctx.text;
      }
      if (ctx.id.startsWith("country")) {
        country = ctx.text;
      }
    }
  }

  // Fallback if the feature itself is the city/state/country
  if (feature.place_type.includes("place") && !city) {
    city = feature.text;
  }
  if (feature.place_type.includes("region") && !state) {
    state = feature.text;
  }
  if (feature.place_type.includes("postcode") && !pincode) {
    pincode = feature.text;
  }
  if (feature.place_type.includes("country") && !country) {
    country = feature.text;
  }

  // Address line: usually the place_name without the city, state, country.
  // Alternatively, if it's an address, `text` is the street, but `address` might be the number.
  // We can just use the full `place_name` or a truncated version.
  // We'll construct a clean address line.
  
  let addressLine = feature.place_name.split(',')[0] || feature.text;
  
  // If the feature is a specific address, let's include the house number and street.
  if (feature.place_type.includes("address")) {
    const houseNumber = feature.properties?.address || "";
    if (houseNumber && feature.text) {
        addressLine = `${houseNumber} ${feature.text}`;
    } else {
        addressLine = feature.place_name.split(',')[0];
    }
  } else if (feature.place_type.includes("poi")) {
      addressLine = feature.text;
  }

  const lon = feature.center ? feature.center[0] : (feature.geometry?.coordinates[0]);
  const lat = feature.center ? feature.center[1] : (feature.geometry?.coordinates[1]);

  return {
    address: addressLine,
    city: city || "",
    state: state || "",
    pincode: pincode || "",
    country: country || "India",
    latitude: lat,
    longitude: lon,
  };
};
