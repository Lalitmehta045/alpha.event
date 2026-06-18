"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2 } from "lucide-react";

interface OrderLocationMapProps {
  lat: number;
  lng: number;
  height?: string;
  className?: string;
}

export default function OrderLocationMap({
  lat,
  lng,
  height = "250px",
  className = "",
}: OrderLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
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
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [lng, lat],
      zoom: 16,
      interactive: false, // Read-only view
      attributionControl: false,
    });

    map.on("load", () => {
      setMapLoaded(true);
      mapRef.current = map;

      // Add marker
      new mapboxgl.Marker({ color: "#F97316" }) // Orange marker for orders
        .setLngLat([lng, lat])
        .addTo(map);
    });

    // Clean up
    return () => {
      map.remove();
    };
  }, [lat, lng]);

  if (error) {
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

  return (
    <div className={`relative w-full ${className}`} style={{ height }}>
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Loading map...</p>
          </div>
        </div>
      )}
      <div
        ref={mapContainerRef}
        className="w-full h-full rounded-lg overflow-hidden pointer-events-none"
      />
    </div>
  );
}
