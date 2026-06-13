"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Loader2 } from "lucide-react";

interface MapLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
  className?: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

export default function MapLocationPicker({
  initialLat = 28.6139, // Default: New Delhi
  initialLng = 77.2090,
  onLocationSelect,
  height = "400px",
  className = "",
}: MapLocationPickerProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [markerPosition, setMarkerPosition] = useState({
    lat: initialLat,
    lng: initialLng,
  });

  const mapRef = useRef<any>(null);

  // Update marker position and pan map when initial props change
  useEffect(() => {
    setMarkerPosition({ lat: initialLat, lng: initialLng });
    if (mapRef.current) {
      mapRef.current.panTo({ lat: initialLat, lng: initialLng });
    }
  }, [initialLat, initialLng]);

  const onMapLoad = useCallback((map: any) => {
    mapRef.current = map;
  }, []);

  const onMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleMapClick = useCallback(
    (e: any) => {
      if (e.latLng) {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        setMarkerPosition({ lat: newLat, lng: newLng });
        onLocationSelect(newLat, newLng);
      }
    },
    [onLocationSelect]
  );

  const handleMarkerDragEnd = useCallback(
    (e: any) => {
      if (e.latLng) {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        setMarkerPosition({ lat: newLat, lng: newLng });
        onLocationSelect(newLat, newLng);
      }
    },
    [onLocationSelect]
  );

  if (loadError) {
    return (
      <div
        className={`bg-red-50 text-red-600 rounded-lg flex items-center justify-center p-4 text-center ${className}`}
        style={{ height }}
      >
        <div>
          <p className="font-semibold mb-1">Failed to load Google Maps</p>
          <p className="text-xs text-red-500">Please check your API key and network connection.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Loading Google Maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={15}
        center={markerPosition}
        options={options}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
        onClick={handleMapClick}
      >
        <Marker
          position={markerPosition}
          draggable={true}
          onDragEnd={handleMarkerDragEnd}
        />
      </GoogleMap>
    </div>
  );
}
