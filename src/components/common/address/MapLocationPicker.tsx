"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2 } from "lucide-react";

interface MapLocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
  className?: string;
}

export default function MapLocationPicker({
  initialLat = 28.6139, // Default: New Delhi
  initialLng = 77.2090,
  onLocationSelect,
  height = "400px",
  className = "",
}: MapLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setError(true);
      return;
    }
    mapboxgl.accessToken = token;

    if (!mapContainerRef.current) return;

    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12", // satellite mode
      center: [initialLng, initialLat],
      zoom: 15,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      setMapLoaded(true);
      mapRef.current = map;

      // Initialize marker
      const marker = new mapboxgl.Marker({ draggable: true, color: "#EF4444" })
        .setLngLat([initialLng, initialLat])
        .addTo(map);

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        onLocationSelect(lngLat.lat, lngLat.lng);
      });

      markerRef.current = marker;
    });

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
        onLocationSelect(lat, lng);
      }
    });

    // Clean up
    return () => {
      map.remove();
    };
  }, []);

  // Sync props changes to map and marker
  useEffect(() => {
    if (mapLoaded && mapRef.current && markerRef.current) {
      mapRef.current.flyTo({ center: [initialLng, initialLat], zoom: 15 });
      markerRef.current.setLngLat([initialLng, initialLat]);
    }
  }, [initialLat, initialLng, mapLoaded]);

  if (error) {
    return (
      <div
        className={`bg-red-50 text-red-600 rounded-lg flex items-center justify-center p-4 text-center ${className}`}
        style={{ height }}
      >
        <div>
          <p className="font-semibold mb-1">Failed to load Mapbox</p>
          <p className="text-xs text-red-500">Please check your NEXT_PUBLIC_MAPBOX_TOKEN.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`} style={{ height }}>
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Loading Map...</p>
          </div>
        </div>
      )}
      <div
        ref={mapContainerRef}
        className="w-full h-full rounded-lg overflow-hidden"
      />
    </div>
  );
}
