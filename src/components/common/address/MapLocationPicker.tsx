"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Next.js
if (typeof window !== "undefined") {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "/leaflet/marker-icon-2x.png",
        iconUrl: "/leaflet/marker-icon.png",
        shadowUrl: "/leaflet/marker-shadow.png",
    });
}

interface MapLocationPickerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (lat: number, lng: number) => void;
    height?: string;
    className?: string;
}

// Component to handle map clicks and marker dragging
function LocationMarker({
    initialLat,
    initialLng,
    onLocationSelect
}: {
    initialLat: number;
    initialLng: number;
    onLocationSelect: (lat: number, lng: number) => void;
}) {
    const [position, setPosition] = useState<L.LatLng>(
        new L.LatLng(initialLat, initialLng)
    );
    const markerRef = useRef<L.Marker>(null);

    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    // Update position when initial coordinates change
    useEffect(() => {
        const newPos = new L.LatLng(initialLat, initialLng);
        setPosition(newPos);
        map.flyTo(newPos, map.getZoom());
    }, [initialLat, initialLng, map]);

    return (
        <Marker
            position={position}
            draggable={true}
            ref={markerRef}
            eventHandlers={{
                dragend() {
                    const marker = markerRef.current;
                    if (marker != null) {
                        const newPos = marker.getLatLng();
                        setPosition(newPos);
                        onLocationSelect(newPos.lat, newPos.lng);
                    }
                },
            }}
        />
    );
}

// Component to set initial view
function SetViewOnChange({ center, zoom }: { center: [number, number]; zoom: number }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);

    return null;
}

export default function MapLocationPicker({
    initialLat = 28.6139, // Default: New Delhi
    initialLng = 77.2090,
    onLocationSelect,
    height = "400px",
    className = "",
}: MapLocationPickerProps) {
    const [isMounted, setIsMounted] = useState(false);

    // Only render map on client side (avoid SSR issues)
    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div
                className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
                style={{ height }}
            >
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading map...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={className} style={{ height }}>
            <MapContainer
                center={[initialLat, initialLng]}
                zoom={13}
                style={{
                    height: "100%",
                    width: "100%",
                    borderRadius: "0.5rem",
                    zIndex: 0
                }}
                scrollWheelZoom={true}
                touchZoom={true}
                dragging={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                />
                <LocationMarker
                    initialLat={initialLat}
                    initialLng={initialLng}
                    onLocationSelect={onLocationSelect}
                />
                <SetViewOnChange center={[initialLat, initialLng]} zoom={13} />
            </MapContainer>
        </div>
    );
}
