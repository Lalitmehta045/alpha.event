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

import { useState } from "react";
import cityStateData from "@/assets/data/cities.json";
import { addAddress } from "@/services/operations/address";
import { RootState } from "@/redux/store/store";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import countryCode from "@/assets/data/countryCode.json";
import FreeLocationComponent from "@/components/common/FreeLocationComponent";
import MapLocationPicker from "@/components/common/address/MapLocationPicker";
import { MapPin, ChevronDown, ChevronUp } from "lucide-react";

interface AddressProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AddAddressDialog({ open, setOpen }: AddressProps) {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  // Find default Indian country code
  const defaultCountryCode =
    countryCode.find((c) => c.flag === "🇮🇳")?.code || "+91";

  const [selectedCountryCode, setSelectedCountryCode] =
    useState(defaultCountryCode);

  const [address, setAddress] = useState({
    address_line: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    status: false,
    mobile: "", // Local mobile number part
  });

  // Map-related state
  const [showMap, setShowMap] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState<{ lat: number, lng: number }>({
    lat: 28.6139, // Default: New Delhi
    lng: 77.2090
  });
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const citiesForSelectedState =
    cityStateData.find((item) => item.state === address.state)?.cities || [];

  // Add detected city to dropdown if not already present
  const allCities = address.city && !citiesForSelectedState.includes(address.city)
    ? [address.city, ...citiesForSelectedState]  // Detected city first
    : citiesForSelectedState;

  const handleAddAddress = async () => {
    if (!token) {
      toast.error("Please login first.");
      return;
    }

    // Check all required fields including the local mobile number input
    if (
      !address.address_line ||
      !address.city ||
      !address.state ||
      !address.pincode ||
      !address.mobile
    ) {
      toast.error("Please fill all fields.");
      return;
    }

    try {
      // Create the final address object for the service call, combining code and number
      const finalAddress = {
        ...address,
        mobile: selectedCountryCode + " " + address.mobile,
      };

      await addAddress(finalAddress, token, dispatch);

      // Reset state after success
      setOpen(false);
      setAddress({
        address_line: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        status: false,
        mobile: "",
      });
      setSelectedCountryCode(defaultCountryCode);

      toast.success("Address added successfully.");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Failed to add address");
    }
  };

  // Reverse geocode coordinates from map to address
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
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
        throw new Error(`Geocoding error: ${response.status}`);
      }

      const data = await response.json();

      if (!data || data.error || !data.address) {
        throw new Error("No address found for this location");
      }

      const addr = data.address;
      const addressParts = [];
      if (addr.road) addressParts.push(addr.road);
      if (addr.suburb) addressParts.push(addr.suburb);

      const detectedCity = addr.city || addr.town || addr.village || addr.county || "";
      const detectedState = addr.state || "";
      const detectedPincode = addr.postcode || "";

      // Auto-select state if found and matches our data
      const matchingState = cityStateData.find(item =>
        item.state.toLowerCase() === detectedState.toLowerCase()
      );

      const finalCity = detectedCity;
      const finalState = matchingState?.state || detectedState;

      setAddress(prev => ({
        ...prev,
        address_line: addressParts.join(", ") || data.display_name.split(",")[0],
        city: finalCity,
        state: finalState,
        pincode: detectedPincode,
        country: addr.country || "India"
      }));

      toast.success("Location selected on map!");
    } catch (error: any) {
      console.error("Reverse geocoding error:", error);
      toast.error("Failed to get address from map. Please enter manually.");
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-92 md:max-w-lg rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Address</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Location Detection */}
          <FreeLocationComponent
            onLocationSelect={(locationData) => {
              // Auto-select state if found and matches our data
              const matchingState = cityStateData.find(item =>
                item.state.toLowerCase() === locationData.state.toLowerCase()
              );

              const matchingCity = matchingState ? matchingState.cities.find(city =>
                city.toLowerCase() === locationData.city.toLowerCase()
              ) : null;

              // Always set the detected city, even if not in our database
              // User can manually select from dropdown if needed
              const finalCity = locationData.city;
              const finalState = matchingState?.state || locationData.state;

              console.log('Location detection:', {
                detected: locationData,
                matchingState,
                matchingCity,
                finalCity,
                finalState
              });

              setAddress(prev => ({
                ...prev,
                address_line: locationData.address,
                city: finalCity,
                state: finalState,
                pincode: locationData.pincode,
                country: locationData.country
              }));

              // Update map coordinates if available
              if (locationData.latitude && locationData.longitude) {
                setMapCoordinates({
                  lat: locationData.latitude,
                  lng: locationData.longitude
                });
              }
            }}
            placeholder="Enter your complete address"
          />

          {/* Map Toggle Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowMap(!showMap)}
            className="w-full border-green-500 text-green-600 hover:bg-green-50 flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            {showMap ? "Hide Map" : "Select on Map"}
            {showMap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {/* Map Component */}
          {showMap && (
            <div className="border-2 border-green-200 rounded-lg p-3 bg-green-50/30">
              <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-green-600" />
                Click or drag the marker to select your location
              </p>
              {isReverseGeocoding && (
                <p className="text-xs text-blue-600 mb-2">
                  Getting address from map...
                </p>
              )}
              <MapLocationPicker
                initialLat={mapCoordinates.lat}
                initialLng={mapCoordinates.lng}
                onLocationSelect={(lat, lng) => {
                  setMapCoordinates({ lat, lng });
                  getAddressFromCoordinates(lat, lng);
                }}
                height="300px"
                className="w-full"
              />
            </div>
          )}


          {/* Address Line */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Address Line :
            </label>
            <Input
              placeholder="Enter address"
              value={address.address_line}
              onChange={(e) =>
                setAddress({ ...address, address_line: e.target.value })
              }
              className="py-5 mt-2 border-gray-400 focus:border-red-500"
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* State Select */}
            <div className="w-full">
              <label className="text-sm font-medium text-gray-700">
                State :
              </label>

              <Select
                value={address.state}
                onValueChange={(value) => {
                  setAddress({
                    ...address,
                    state: value,
                    city: "", // clear city when state changes
                  });
                }}
              >
                <SelectTrigger className="py-5 w-full cursor-pointer mt-2 border-gray-400 focus:border-red-500">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>

                <SelectContent>
                  {cityStateData.map((item) => (
                    <SelectItem key={item.state} value={item.state}>
                      {item.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City Select */}
            <div className="w-full">
              <label className="text-sm font-medium text-gray-700">
                City :
              </label>

              <Select
                value={address.city}
                onValueChange={(value) =>
                  setAddress({ ...address, city: value })
                }
                disabled={!address.state}
              >
                <SelectTrigger className="py-5 w-full cursor-pointer mt-2 border-gray-400 focus:border-red-500 disabled:opacity-70">
                  <SelectValue
                    placeholder={
                      address.state ? "Select city" : "Select state first"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {allCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Pincode */}
            <div className="w-full md:w-1/2">
              <label className="text-sm font-medium text-gray-700">
                Pincode :
              </label>
              <Input
                type="text"
                placeholder="Enter pincode"
                value={address.pincode}
                onChange={(e) =>
                  setAddress({ ...address, pincode: e.target.value })
                }
                className="py-5 mt-2 border-gray-400 focus:border-red-500"
              />
            </div>

            {/* Country */}
            <div className="w-full md:w-1/2">
              <label className="text-sm font-medium text-gray-700">
                Country :
              </label>
              <Input
                placeholder="Enter country"
                value={address.country}
                onChange={(e) =>
                  setAddress({ ...address, country: e.target.value })
                }
                className="py-5 mt-2 border-gray-400 focus:border-red-500"
              />
            </div>
          </div>

          {/* Mobile No. - UPDATED SECTION with Country Code */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Mobile No. :
            </label>
            <div className="flex gap-2 mt-2">
              {/* Country Code Select */}
              <Select
                value={selectedCountryCode}
                onValueChange={setSelectedCountryCode}
              >
                <SelectTrigger className="w-1/3 max-w-max py-5 border-gray-400 focus:border-red-500">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  {countryCode.map((item) => (
                    <SelectItem key={item.id} value={item.code}>
                      <span className="mr-2">{item.flag}</span>
                      {item.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Mobile Number Input */}
              <Input
                type="tel"
                placeholder="Enter local mobile number"
                value={address.mobile}
                onChange={
                  (e) =>
                    setAddress({
                      ...address,
                      mobile: e.target.value.replace(/[^0-9]/g, ""),
                    }) // Filter non-numeric
                }
                className="w-2/3 flex-1 py-5 border-gray-400"
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            className="bg-red-950 hover:bg-red-900 py-6 mt-2 transition-all duration-200"
            onClick={handleAddAddress}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
