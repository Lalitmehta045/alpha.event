"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import { useLocationSearch } from "@/hooks/useLocationSearch";
import { useMapboxLocation } from "@/hooks/useMapboxLocation";
import { LocationData } from "@/utils/mapboxAddressMapper";

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const {
    suggestions,
    loading: searchLoading,
    debouncedSearch,
    clearSuggestions,
    mapSuggestionToLocation,
    getSuggestionText,
    getSuggestionSubtext,
    getSuggestionId
  } = useLocationSearch();

  const {
    detectLocation,
    detecting: locationDetecting,
  } = useMapboxLocation();

  // Handle current location detection
  const handleGetCurrentLocation = async () => {
    // Check if the page is served over HTTPS or localhost
    if (window.location.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      toast.error("Location access requires a secure (HTTPS) connection or localhost");
      return;
    }

    const toastId = toast.loading("Detecting your location...");

    try {
      const locationData = await detectLocation();
      setAddress(locationData.address);
      onLocationSelect(locationData);
      setShowSuggestions(false);
      clearSuggestions();
      toast.success("Location detected successfully!", { id: toastId });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to detect location";
      toast.error(errorMessage, { id: toastId });
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: any) => {
    const locationData = mapSuggestionToLocation(suggestion);
    setAddress(locationData.address);
    onLocationSelect(locationData);
    setShowSuggestions(false);
    clearSuggestions();
  };

  // Handle manual address input
  const handleAddressChange = (value: string) => {
    setAddress(value);
    debouncedSearch(value);
    if (value.length >= 3) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      clearSuggestions();
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (address.length >= 3 && suggestions.length > 0) {
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
        disabled={locationDetecting || disabled}
        variant="outline"
        className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
      >
        {locationDetecting ? (
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
                clearSuggestions();
                setShowSuggestions(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (suggestions.length > 0 || searchLoading) && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {searchLoading && suggestions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Searching...
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <button
                  key={getSuggestionId(suggestion, index)}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900">
                    {getSuggestionText(suggestion)}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {getSuggestionSubtext(suggestion)}
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}