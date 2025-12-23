"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import cityStateData from "@/assets/data/cities.json";
import toast from "react-hot-toast";
import { editAddress } from "@/services/operations/address";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { AddressType } from "@/@types/address";
import countryCode from "@/assets/data/countryCode.json";

interface AddressProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  addressData?: any;
  onUpdate?: (updated: any) => void;
}

export default function EditAddressDialog({
  open,
  setOpen,
  addressData,
  onUpdate,
}: AddressProps) {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  // Default Indian code
  const defaultCountryCode =
    countryCode.find((c) => c.flag === "🇮🇳")?.code || "+91";

  const [selectedCountryCode, setSelectedCountryCode] =
    useState(defaultCountryCode);

  const [address, setAddress] = useState<AddressType>({
    _id: "",
    address_line: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    status: false,
    mobile: "",
  });

  const citiesForSelectedState =
    cityStateData.find((item) => item.state === address.state)?.cities || [];

  // Prefill form
  useEffect(() => {
    if (addressData) {
      let countryCodeFromDB = defaultCountryCode;
      let mobileNumber = "";

      if (addressData.mobile) {
        // Split using "-" instead of space
        const parts = addressData.mobile.split(" ");
        if (parts.length === 2) {
          countryCodeFromDB = parts[0]; // "+91"
          mobileNumber = parts[1]; // "8349020828"
        }
      }

      setSelectedCountryCode(countryCodeFromDB);

      setAddress({
        _id: addressData._id || "",
        address_line: addressData.address_line || "",
        city: addressData.city || "",
        state: addressData.state || "",
        pincode: addressData.pincode || "",
        country: addressData.country || "India",
        status: addressData.status ?? false,
        mobile: mobileNumber,
      });
    }
  }, [addressData]);

  const handleUpdateAddress = async () => {
    if (!token) return toast.error("Please login first.");

    if (
      !address.address_line ||
      !address.city ||
      !address.state ||
      !address.pincode ||
      !address.mobile
    ) {
      return toast.error("Please fill all fields");
    }

    // Final format: "+91-8349020828"
    const updatedAddress = {
      ...address,
      mobile: `${selectedCountryCode} ${address.mobile}`,
    };

    if (onUpdate) onUpdate(updatedAddress);

    await editAddress(address._id!, updatedAddress, token, dispatch);

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

    toast.success("Address updated successfully!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-92 md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Address</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2">
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
              className="py-5 mt-2 border-gray-400"
            />
          </div>

          {/* State + City */}
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

          {/* Pincode + Country */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <label className="text-sm font-medium text-gray-700">
                Pincode :
              </label>
              <Input
                placeholder="Enter pincode"
                value={address.pincode}
                onChange={(e) =>
                  setAddress({ ...address, pincode: e.target.value })
                }
                className="py-5 mt-2 border-gray-400"
              />
            </div>

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
                className="py-5 mt-2 border-gray-400"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Mobile No. :
            </label>
            <div className="flex gap-2 mt-2">
              <Select
                value={selectedCountryCode}
                onValueChange={setSelectedCountryCode}
              >
                <SelectTrigger className="w-1/3 max-w-max py-5 border-gray-400">
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

              <Input
                placeholder="Enter mobile number"
                value={address.mobile}
                onChange={(e) =>
                  setAddress({
                    ...address,
                    mobile: e.target.value.replace(/[^0-9]/g, ""),
                  })
                }
                className="w-2/3 flex-1 py-5 border-gray-400"
              />
            </div>
          </div>

          <Button
            className="bg-red-950 hover:bg-red-900 py-6 mt-2"
            onClick={handleUpdateAddress}
          >
            Update
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
