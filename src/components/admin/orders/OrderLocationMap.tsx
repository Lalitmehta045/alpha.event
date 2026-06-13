"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Loader2 } from "lucide-react";

interface OrderLocationMapProps {
  lat: number;
  lng: number;
  height?: string;
  className?: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
};

const mapOptions = {
  disableDefaultUI: true, // disable controls for read-only view
  zoomControl: false,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  gestureHandling: "none", // disable all interactions
};

export default function OrderLocationMap({
  lat,
  lng,
  height = "250px",
  className = "",
}: OrderLocationMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  const [position, setPosition] = useState({ lat, lng });
  const mapRef = useRef<any>(null);

  useEffect(() => {
    setPosition({ lat, lng });
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
    }
  }, [lat, lng]);

  const onLoad = useCallback((map: any) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  if (loadError) {
    return (
      <div
        className={`bg-red-50 text-red-600 rounded-lg flex items-center justify-center p-4 text-center ${className}`}
        style={{ height }}
      >
        <div>
          <p className="font-semibold mb-1">Failed to load Map</p>
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
          <Loader2 className="w-6 h-6 animate-spin text-orange-500 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={16}
        center={position}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        <Marker position={position} />
      </GoogleMap>
    </div>
  );
}
