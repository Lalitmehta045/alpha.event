"use client";

import { useState } from "react";
import FreeLocationComponent from "@/components/common/FreeLocationComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MapPin, Check, AlertTriangle, Truck, Shield, Search } from "lucide-react";
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

export default function CheckoutPage() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationSelect = (locationData: LocationData) => {
    console.log("Location selected:", locationData);
    setLocation(locationData);
    validateLocation(locationData);
  };

  const validateLocation = (loc: LocationData) => {
    const errors: string[] = [];

    if (!loc.address || loc.address.trim().length < 5) {
      errors.push("Please enter a complete address");
    }

    if (!loc.city || loc.city.trim().length < 2) {
      errors.push("City is required");
    }

    if (!loc.state || loc.state.trim().length < 2) {
      errors.push("State is required");
    }

    if (!loc.pincode || !/^\d{6}$/.test(loc.pincode)) {
      errors.push("Please enter a valid 6-digit pincode");
    }

    if (!loc.country || loc.country.trim().length < 2) {
      errors.push("Country is required");
    }

    setValidationErrors(errors);

    if (errors.length === 0) {
      toast.success("Address validated successfully!");
    } else {
      toast.error("Please fix validation errors");
    }
  };

  const handleProceedToPayment = async () => {
    if (!location) {
      toast.error("Please select or enter a delivery address");
      return;
    }

    if (validationErrors.length > 0) {
      toast.error("Please fix validation errors before proceeding");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Processing your address...");

    try {
      // Simulate API call to save address
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically:
      // 1. Save address to your backend
      // 2. Update your Redux state
      // 3. Proceed to payment/shipping options
      
      console.log("Proceeding to payment with location:", location);
      
      toast.success("Address saved! Proceeding to payment...");
      
      // Example: Navigate to payment page
      // router.push('/payment');
      
    } catch (error) {
      console.error("Address save error:", error);
      toast.error("Failed to save address. Please try again.");
    } finally {
      setIsSubmitting(false);
      toast.dismiss();
    }
  };

  const handleManualEdit = (field: keyof LocationData, value: string) => {
    if (location) {
      const updatedLocation = { ...location, [field]: value };
      setLocation(updatedLocation);
      validateLocation(updatedLocation);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Checkout
          </h1>
          <p className="text-lg text-gray-600">
            Enter your delivery address to continue
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Location Input Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FreeLocationComponent
                  onLocationSelect={handleLocationSelect}
                  placeholder="Enter your complete delivery address"
                  disabled={isSubmitting}
                />

                {/* Status Indicators */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-green-600">
                    <Check className="w-3 h-3 mr-1" />
                    OpenStreetMap Active
                  </Badge>
                  {typeof window !== "undefined" && window.location.protocol === "https:" && (
                    <Badge variant="secondary" className="text-blue-600">
                      <Shield className="w-3 h-3 mr-1" />
                      HTTPS Secure
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Address Display */}
          <div className="space-y-6">
            {/* Selected Location Display */}
            {location && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Address Fields for Manual Editing */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Street Address</label>
                      <input
                        type="text"
                        value={location.address}
                        onChange={(e) => handleManualEdit("address", e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter street address"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">City</label>
                        <input
                          type="text"
                          value={location.city}
                          onChange={(e) => handleManualEdit("city", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="City"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">State</label>
                        <input
                          type="text"
                          value={location.state}
                          onChange={(e) => handleManualEdit("state", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="State"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Pincode</label>
                        <input
                          type="text"
                          value={location.pincode}
                          onChange={(e) => handleManualEdit("pincode", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="6-digit pincode"
                          maxLength={6}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700">Country</label>
                        <input
                          type="text"
                          value={location.country}
                          onChange={(e) => handleManualEdit("country", e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Country"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {/* Coordinates Display */}
                    {location.latitude && location.longitude && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
                        📍 Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Validation Errors</span>
                      </div>
                      <ul className="text-sm text-red-600 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-red-500">•</span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">GPS Location</h4>
                      <p className="text-sm text-gray-600">High accuracy location detection</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Search className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Address Autocomplete</h4>
                      <p className="text-sm text-gray-600">Smart suggestions as you type</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Privacy First</h4>
                      <p className="text-sm text-gray-600">No tracking, completely free</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>🔒 Your location data is secure and encrypted</p>
                  <p>📍 Powered by OpenStreetMap • Free forever</p>
                </div>

                <Button
                  onClick={handleProceedToPayment}
                  disabled={!location || validationErrors.length > 0 || isSubmitting}
                  className="px-8 py-3 text-lg font-semibold"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to Payment
                      <Truck className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
