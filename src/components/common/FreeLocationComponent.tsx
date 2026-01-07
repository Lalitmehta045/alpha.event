"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Search, X } from "lucide-react";
import toast from "react-hot-toast";

interface LocationData {
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

interface NominatimSuggestion {
  place_id: string;
  display_name: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  lat: string;
  lon: string;
  boundingbox: [string, string, string, string];
}

interface FreeLocationComponentProps {
  onLocationSelect: (location: LocationData) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  initialAddress?: string;
}

export default function FreeLocationComponent({
  onLocationSelect,
  placeholder = "Enter your address",
  className = "",
  disabled = false,
  initialAddress = ""
}: FreeLocationComponentProps) {
  const [address, setAddress] = useState(initialAddress);
  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Custom debounce implementation
  const debouncedSearch = useCallback((query: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      searchAddressSuggestions(query);
    }, 500);
  }, []);

  // Parse Nominatim response to LocationData
  const parseNominatimData = (data: NominatimSuggestion): LocationData => {
    const addr = data.address;
    
    // Debug: Log what we're extracting
    console.log("Extracting from Nominatim:", {
      city: addr.city || addr.town || addr.village || addr.county || "",
      state: addr.state || "",
      pincode: addr.postcode || "",
      postcode: addr.postcode || "",
      country: addr.country || ""
    });
    
    // Build address line
    const addressParts = [];
    if (addr.road) addressParts.push(addr.road);
    if (addr.suburb) addressParts.push(addr.suburb);
    
    return {
      address: addressParts.join(", ") || data.display_name.split(",")[0],
      city: addr.city || addr.town || addr.village || addr.county || "",
      state: addr.state || "",
      pincode: addr.postcode || "",
      country: addr.country || "",
      latitude: parseFloat(data.lat),
      longitude: parseFloat(data.lon)
    };
  };

  // Get address from coordinates using Nominatim reverse geocoding
  const getAddressFromCoordinates = async (lat: number, lon: number): Promise<LocationData> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18&countrycodes=in`,
        {
          headers: {
            'User-Agent': 'AlphaEventApp/1.0 (contact@alphaevent.com)'
          },
          signal: AbortSignal.timeout(10000)
        }
      );

      if (!response.ok) {
        throw new Error(`Nominatim API error: ${response.status}`);
      }

      const data = await response.json();

      // Debug: Log the full Nominatim response
      console.log("Full Nominatim Response:", data);
      console.log("Address field:", data.address);

      if (!data || data.error) {
        throw new Error(data?.error || "No address found for these coordinates");
      }

      // Check if address field exists
      if (!data.address) {
        console.error("No address field in Nominatim response");
        throw new Error("Invalid address data received from Nominatim API");
      }

      return parseNominatimData(data);
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      throw error;
    }
  };

  // Search for address suggestions using Nominatim
  const searchAddressSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=in`,
        {
          headers: {
            'User-Agent': 'AlphaEventApp/1.0 (contact@alphaevent.com)'
          },
          signal: AbortSignal.timeout(8000)
        }
      );

      if (!response.ok) {
        throw new Error(`Search error: ${response.status}`);
      }

      const data: NominatimSuggestion[] = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Address search error:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle current location detection
  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);
    toast.loading("Detecting your location...");

    try {
      // Try high accuracy first
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Get address from coordinates
      const locationData = await getAddressFromCoordinates(latitude, longitude);
      setAddress(locationData.address);
      onLocationSelect(locationData);
      setShowSuggestions(false);
      
      toast.success("Location detected successfully!");
    } catch (error: any) {
      console.error("Location detection error:", error);
      
      if (error.code === 1) {
        toast.error("Location access denied. Please enable location permissions.");
      } else if (error.code === 2) {
        toast.error("Location unavailable. Please check your device's location services.");
      } else if (error.code === 3) {
        toast.error("Location request timed out. Please try again.");
      } else {
        toast.error("Failed to detect location. Please enter address manually.");
      }
    } finally {
      setIsDetecting(false);
      toast.dismiss();
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: NominatimSuggestion) => {
    const locationData = parseNominatimData(suggestion);
    setAddress(locationData.address);
    onLocationSelect(locationData);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Handle manual address input
  const handleAddressChange = (value: string) => {
    setAddress(value);
    debouncedSearch(value);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (address.length >= 3) {
      setShowSuggestions(true);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative space-y-3 ${className}`}>
      {/* Current Location Button */}
      <Button
        onClick={handleGetCurrentLocation}
        disabled={isDetecting || disabled}
        variant="outline"
        className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
      >
        {isDetecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Detecting Location...
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4" />
            Use Current Location
          </>
        )}
      </Button>

      {/* Address Input with Autocomplete */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full pl-10 pr-10"
          />
          {address && (
            <button
              onClick={() => {
                setAddress("");
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.place_id}-${index}`}
                onClick={() => handleSuggestionSelect(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900">
                  {suggestion.display_name.split(',')[0]}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {suggestion.display_name}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}