"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import cityStateData from "@/assets/data/cities.json";
import { addAddress } from "@/services/operations/address";
import { RootState } from "@/redux/store/store";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import countryCode from "@/assets/data/countryCode.json";
import FreeLocationComponent from "@/components/common/FreeLocationComponent";
import { MapPin, Loader2, ArrowLeft, Crosshair } from "lucide-react";

// Dynamic import to avoid SSR issues with Google Maps
const MapLocationPicker = dynamic(
  () => import("@/components/common/address/MapLocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Loading Google Maps...</p>
        </div>
      </div>
    )
  }
);

interface AddressProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AddAddressDialog({ open, setOpen }: AddressProps) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const token = useSelector((state: RootState) => state.auth.token) as string;

  // Find default Indian country code
  const defaultCountryCode =
    countryCode.find((c) => c.flag === "🇮🇳")?.code || "+91";

  const [selectedCountryCode, setSelectedCountryCode] =
    useState(defaultCountryCode);

  const [step, setStep] = useState<"map" | "details">("map");
  const [mapCoordinates, setMapCoordinates] = useState({
    lat: 28.6139, // Default: New Delhi
    lng: 77.2090,
  });

  const [address, setAddress] = useState({
    address_line: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    status: false,
    mobile: "", // Local mobile number part
    location: { lat: 0, lng: 0 } as { lat: number; lng: number },
  });

  // Detailed inputs for step 2 (Zomato/Swiggy UX)
  const [houseDetails, setHouseDetails] = useState("");
  const [landmark, setLandmark] = useState("");
  const [geocodingLoading, setGeocodingLoading] = useState(false);

  // Reset state when dialog opens (don't auto-trigger geolocation — let user choose)
  useEffect(() => {
    if (open && step === "map") {
      // Don't auto-trigger geolocation — users can tap the GPS button or search manually
      // This avoids the "Could not auto-detect location" error on every open
    }
  }, [open, step]);

  const [locatingMe, setLocatingMe] = useState(false);

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocatingMe(true);
    const toastId = toast.loading("Detecting your location...");

    const onSuccess = async (position: GeolocationPosition) => {
      try {
        const { latitude, longitude } = position.coords;
        setMapCoordinates({ lat: latitude, lng: longitude });
        await handleMapLocationSelect(latitude, longitude);
        toast.success("Location detected!", { id: toastId });
      } catch {
        toast.dismiss(toastId);
      } finally {
        setLocatingMe(false);
      }
    };

    const onFinalError = (err: GeolocationPositionError) => {
      console.warn("Geolocation failed:", err);
      setLocatingMe(false);

      if (err.code === 1) {
        toast.error("Location permission denied. You can pick a spot on the map or search above.", { id: toastId, duration: 3000 });
      } else {
        // Show a brief, non-alarming message instead of a persistent error
        toast("Tap on the map or search to pick your location.", { id: toastId, icon: "📍", duration: 2500 });
      }
    };

    // Try with high accuracy first, fallback to low accuracy
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      (error) => {
        console.warn("High accuracy failed, trying low accuracy:", error);
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          onFinalError,
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  };

  // Handle map location selection with reverse geocoding
  const handleMapLocationSelect = async (lat: number, lng: number) => {
    try {
      setGeocodingLoading(true);

      // Reverse geocoding using Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&countrycodes=in`,
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

      if (!data || data.error || !data.address) {
        throw new Error("No address found for this location");
      }

      const addr = data.address;

      // Extract address components
      const addressParts: string[] = [];
      if (addr.road) addressParts.push(addr.road);
      if (addr.suburb) addressParts.push(addr.suburb);
      if (addr.neighbourhood) addressParts.push(addr.neighbourhood);

      const detectedCity = addr.city || addr.town || addr.village || addr.county || "";
      const detectedState = addr.state || "";
      const detectedPincode = addr.postcode || "";
      const detectedCountry = addr.country || "India";

      // Auto-fill address fields + save coordinates
      setAddress(prev => ({
        ...prev,
        address_line: addressParts.join(", ") || data.display_name.split(",")[0],
        city: detectedCity,
        state: detectedState,
        pincode: detectedPincode,
        country: detectedCountry,
        location: { lat, lng }
      }));

      setMapCoordinates({ lat, lng });
    } catch (error: any) {
      console.error("Reverse geocoding error:", error);
    } finally {
      setGeocodingLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!isAuthenticated) {
      toast.error("Please login first.");
      return;
    }

    // Build the final address line incorporating Zomato-style fields
    const finalAddressLine = `${houseDetails.trim() ? houseDetails.trim() + ", " : ""}${address.address_line.trim()}${landmark.trim() ? " (Landmark: " + landmark.trim() + ")" : ""}`;

    if (!finalAddressLine || !address.city || !address.pincode || !address.mobile) {
      toast.error("Please fill in all address details.");
      return;
    }

    try {
      // Create the final address object for the service call, combining code and number
      const finalAddress = {
        ...address,
        address_line: finalAddressLine,
        state: address.state || "Delhi", // Fallback state so backend validation passes
        country: address.country || "India",
        mobile: selectedCountryCode + " " + address.mobile,
        location: address.location.lat !== 0 && address.location.lng !== 0
          ? address.location
          : undefined,
      };

      await addAddress(finalAddress, token, dispatch);

      // Reset state after success
      setOpen(false);
      setStep("map");
      setHouseDetails("");
      setLandmark("");
      setAddress({
        address_line: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        status: false,
        mobile: "",
        location: { lat: 0, lng: 0 },
      });
      setSelectedCountryCode(defaultCountryCode);

      toast.success("Address added successfully.");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Failed to add address");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) {
        setStep("map");
      }
    }}>
      <DialogContent className="max-w-92 md:max-w-md rounded-xl max-h-[95vh] flex flex-col p-0 overflow-hidden border border-gray-100 shadow-2xl">
        
        {step === "map" ? (
          /* ================== STEP 1: MAP VIEW ================== */
          <div className="flex flex-col h-full w-full">
            <DialogHeader className="p-4 border-b border-gray-100 bg-white">
              <DialogTitle className="text-gray-800 text-lg font-bold">Select Delivery Location</DialogTitle>
            </DialogHeader>

            {/* Address Search / Suggestion Bar */}
            <div className="px-4 py-3 bg-white z-20">
              <FreeLocationComponent
                onLocationSelect={(locationData) => {
                  if (locationData.latitude && locationData.longitude) {
                    setMapCoordinates({
                      lat: locationData.latitude,
                      lng: locationData.longitude
                    });
                    setAddress(prev => ({
                      ...prev,
                      address_line: locationData.address,
                      city: locationData.city,
                      state: locationData.state,
                      pincode: locationData.pincode,
                      country: locationData.country,
                      location: { lat: locationData.latitude!, lng: locationData.longitude! }
                    }));
                  }
                }}
                placeholder="Search for area, street name..."
              />
            </div>

            {/* Map Area */}
            <div className="relative w-full h-[280px] bg-gray-50">
              <MapLocationPicker
                initialLat={mapCoordinates.lat}
                initialLng={mapCoordinates.lng}
                onLocationSelect={handleMapLocationSelect}
                height="100%"
              />

              {/* Floating "Locate Me" GPS Button */}
              <button
                type="button"
                onClick={requestCurrentLocation}
                disabled={locatingMe}
                className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 text-red-600 rounded-full p-2.5 shadow-md border border-gray-100 flex items-center justify-center hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Detect my location"
              >
                {locatingMe ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Crosshair className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Selected Address Display Card */}
            <div className="p-4 bg-white flex flex-col gap-4 border-t border-gray-100">
              <div className="flex gap-3 items-start">
                <div className="bg-red-50 p-2 rounded-lg text-red-600 mt-1">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] tracking-wider uppercase text-gray-400 font-bold">Your Selected Location</span>
                  {geocodingLoading ? (
                    <div className="h-5 w-4/5 bg-gray-100 animate-pulse rounded mt-1"></div>
                  ) : (
                    <p className="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 mt-0.5">
                      {address.address_line || "Select location from map"}
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={() => {
                  if (!address.address_line) {
                    toast.error("Please pick a location on the map first.");
                    return;
                  }
                  setStep("details");
                }}
                disabled={geocodingLoading || !address.address_line}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-5 rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-200"
              >
                Confirm Location & Proceed
              </Button>
            </div>
          </div>
        ) : (
          /* ================== STEP 2: DETAILS FORM ================== */
          <div className="flex flex-col h-full w-full bg-gray-50">
            {/* Header with Back Button */}
            <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-100">
              <button
                type="button"
                onClick={() => setStep("map")}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex-1">
                <h3 className="text-gray-800 text-base font-bold">Enter Address Details</h3>
              </div>
            </div>

            {/* Address Summary */}
            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between gap-4">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium leading-none">Delivering to</p>
                  <p className="text-xs font-semibold text-gray-700 truncate mt-1">
                    {address.address_line}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep("map")}
                className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-2 py-1.5 rounded"
              >
                CHANGE
              </button>
            </div>

            {/* Scrollable Form Fields */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-h-[50vh]">
              {/* House / Flat No. */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  House / Flat / Block No. <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Flat 402, Building A"
                  value={houseDetails}
                  onChange={(e) => setHouseDetails(e.target.value)}
                  className="bg-white border-gray-200 focus:border-red-500 mt-1 py-4 text-sm font-semibold rounded-lg focus-visible:ring-0"
                />
              </div>

              {/* Area / Road (Read-only reference) */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Area / Road name
                </label>
                <Input
                  value={address.address_line}
                  onChange={(e) => setAddress(prev => ({ ...prev, address_line: e.target.value }))}
                  className="bg-white border-gray-200 mt-1 py-4 text-sm font-semibold rounded-lg"
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Landmark (Optional)
                </label>
                <Input
                  placeholder="e.g. Opposite Metro Station"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="bg-white border-gray-200 focus:border-red-500 mt-1 py-4 text-sm font-semibold rounded-lg focus-visible:ring-0"
                />
              </div>

              {/* City & Pincode Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    City <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter City"
                    value={address.city}
                    onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                    className="bg-white border-gray-200 focus:border-red-500 mt-1 py-4 text-sm font-semibold rounded-lg focus-visible:ring-0"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter Pincode"
                    value={address.pincode}
                    onChange={(e) => setAddress(prev => ({ ...prev, pincode: e.target.value }))}
                    className="bg-white border-gray-200 focus:border-red-500 mt-1 py-4 text-sm font-semibold rounded-lg focus-visible:ring-0"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mt-1">
                  <Select
                    value={selectedCountryCode}
                    onValueChange={setSelectedCountryCode}
                  >
                    <SelectTrigger className="w-[85px] bg-white border-gray-200 text-sm font-semibold rounded-lg focus-visible:ring-0">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCode.map((item) => (
                        <SelectItem key={item.id} value={item.code}>
                          <span className="mr-1">{item.flag}</span>
                          {item.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={address.mobile}
                    onChange={(e) =>
                      setAddress(prev => ({
                        ...prev,
                        mobile: e.target.value.replace(/[^0-9]/g, ""),
                      }))
                    }
                    className="flex-1 bg-white border-gray-200 focus:border-red-500 py-4 text-sm font-semibold rounded-lg focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="p-4 bg-white border-t border-gray-100 z-10">
              <Button
                onClick={handleAddAddress}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-5 rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-200"
              >
                Save & Proceed
              </Button>
            </div>
          </div>
        )}
        
      </DialogContent>
    </Dialog>
  );
}
