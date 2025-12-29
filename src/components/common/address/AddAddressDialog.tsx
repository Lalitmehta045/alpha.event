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
import { FaLocationArrow } from "react-icons/fa";

interface AddressProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface LocationData {
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
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

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const citiesForSelectedState =
    cityStateData.find((item) => item.state === address.state)?.cities || [];

  // Function to get address from coordinates using reverse geocoding
  const getAddressFromCoordinates = async (lat: number, lon: number): Promise<LocationData | null> => {
    try {
      // Using Nominatim (OpenStreetMap) for reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&countrycodes=in`,
        {
          headers: {
            'User-Agent': 'AlphaArtEvents/1.0'
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        return {
          address_line: "", // Keep address line empty for user to fill
          city: addr.city || addr.town || addr.village || '',
          state: addr.state || '',
          pincode: addr.postcode || '',
          country: addr.country || 'India'
        };
      } else {
        throw new Error('No address data found');
      }
    } catch (error: any) {
      console.error('Error getting address from coordinates:', error);
      if (error.name === 'AbortError') {
        throw new Error('Address lookup timed out');
      } else if (error.name === 'TypeError' || error.message?.includes('fetch')) {
        throw new Error('Network error while fetching address');
      } else {
        throw new Error('Failed to get address from location');
      }
    }
  };

  // Function to detect current location
  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingLocation(true);
    toast.loading("Detecting your location...");

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          reject, 
          {
            enableHighAccuracy: false, // Set to false for faster response
            timeout: 5000, // Reduced timeout to 5 seconds
            maximumAge: 60000 // Allow cached position up to 1 minute old
          }
        );
      });

      const { latitude, longitude } = position.coords;
      console.log('Got coordinates:', { latitude, longitude });
      
      // Try to get address from coordinates
      let locationData = null;
      try {
        locationData = await getAddressFromCoordinates(latitude, longitude);
        console.log('Got location data:', locationData);
      } catch (apiError: any) {
        console.error('Reverse geocoding failed:', apiError);
        // Continue with fallback
      }

      if (locationData) {
        setAddress(prev => ({
          ...prev,
          address_line: locationData.address_line,
          city: locationData.city,
          state: locationData.state,
          pincode: locationData.pincode,
          country: locationData.country
        }));
        toast.success("Location detected successfully!");
        setRetryCount(0); // Reset retry count on success
      } else {
        // Fallback: Keep address line empty for user to fill
        setAddress(prev => ({
          ...prev,
          address_line: "", // Keep address line empty
          city: "",
          state: "",
          pincode: "",
          country: "India"
        }));
        toast.success("Location detected! Please enter your complete address details.");
        setRetryCount(0); // Reset retry count on success
      }
    } catch (error: any) {
      console.error('Location detection error:', error);
      console.error('Error details:', {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        toString: error?.toString?.(),
        stack: error?.stack,
        isGeolocationPositionError: error?.name === 'GeolocationPositionError'
      });
      
      // Handle specific geolocation errors
      if (error?.name === 'GeolocationPositionError' || error?.code !== undefined) {
        // This is a standard geolocation error
        switch (error?.code) {
          case 1:
            toast.error("Location access denied. Please enable location permissions in your browser settings and try again.");
            setRetryCount(0);
            break;
          case 2:
            toast.error("Location unavailable. Please check if your device's location services are enabled.");
            setRetryCount(0);
            break;
          case 3:
            // Timeout error - offer retry
            if (retryCount < 2) {
              toast.error("Location request timed out. Retrying...");
              setRetryCount(prev => prev + 1);
              setTimeout(() => handleDetectLocation(), 1000); // Retry after 1 second
              return; // Don't set isDetectingLocation to false yet
            } else {
              toast.error("Location request timed out after multiple attempts. Please try entering your address manually.");
              setRetryCount(0);
            }
            break;
          default:
            toast.error("Location detection failed. Please try entering your address manually.");
            setRetryCount(0);
        }
      } else if (error?.name === 'TypeError' || error?.message?.includes('network') || error?.message?.includes('fetch')) {
        toast.error("Network error. Please check your internet connection and try again.");
        setRetryCount(0);
      } else if (error?.message?.includes('timed out') || error?.name === 'AbortError') {
        toast.error("Address lookup timed out. Please try again.");
        setRetryCount(0);
      } else if (!error || Object.keys(error).length === 0) {
        // Handle empty error object
        toast.error("Location detection failed. This might be due to network issues or browser restrictions. Please try entering your address manually.");
        setRetryCount(0);
      } else {
        toast.error(`Location detection failed: ${error?.message || 'Unknown error'}. You can enter your address manually.`);
        setRetryCount(0);
      }
    } finally {
      setIsDetectingLocation(false);
      toast.dismiss();
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-92 md:max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle>Add Address</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Auto Location Detection Button */}
          <Button
            onClick={handleDetectLocation}
            disabled={isDetectingLocation}
            variant="outline"
            className="w-full py-3 border-blue-500 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
          >
            <FaLocationArrow className="w-4 h-4" />
            {isDetectingLocation ? "Detecting Location..." : "Use Current Location"}
          </Button>

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
                  {citiesForSelectedState.map((city) => (
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
