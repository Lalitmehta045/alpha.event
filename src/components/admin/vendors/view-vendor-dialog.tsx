"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import { toast } from "react-toastify";
import ViewImage from "@/components/admin/ViewImage";

interface ViewVendorDialogProps {
  open: boolean;
  vendor: any; // The vendor object
  token: string;
  onOpenChange: (open: boolean) => void;
  fetchVendors: () => void;
}

export default function ViewVendorDialog({
  open,
  vendor,
  token,
  onOpenChange,
  fetchVendors,
}: ViewVendorDialogProps) {
  const [loading, setLoading] = useState(false);
  const [viewImageURL, setViewImageURL] = useState("");

  const updateStatus = async (status: string) => {
    try {
      setLoading(true);
      const res = await axios.put(
        `/api/admin/vendor-accounts/${vendor._id}`,
        { vendorStatus: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`Vendor ${status} successfully`);
        onOpenChange(false);
        fetchVendors();
      } else {
        toast.error(res.data.message || "Failed to update vendor");
      }
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewId = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/vendor/product/preview-image?key=${encodeURIComponent(
          vendor.idProof
        )}`
      );
      if (res.data.url) {
        setViewImageURL(res.data.url);
      } else {
        setViewImageURL(vendor.idProof);
      }
    } catch (error) {
      setViewImageURL(vendor.idProof);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Review Vendor Account</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input value={`${vendor.fname} ${vendor.lname}`} readOnly className="bg-gray-50 mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={vendor.email} readOnly className="bg-gray-50 mt-1" />
              </div>
            </div>

            <div>
              <Label>Business Categories</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {vendor.vendorCategories?.map((cat: any) => (
                  <span
                    key={cat._id}
                    className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-200"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <Label>Business Address</Label>
              <Textarea value={vendor.vendorAddress} readOnly className="bg-gray-50 mt-1 resize-none" rows={3} />
            </div>

            <div>
              <Label>ID Proof</Label>
              <div className="mt-1">
                {vendor.idProof ? (
                  <Button
                    variant="outline"
                    onClick={handlePreviewId}
                    disabled={loading}
                    className="w-full justify-between"
                  >
                    <span>View Submitted Document</span>
                    {loading ? <ClipLoader size={16} /> : <span>👁️</span>}
                  </Button>
                ) : (
                  <p className="text-sm text-red-500 italic">No document uploaded.</p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {vendor.vendorStatus === "Pending_Review" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => updateStatus("Rejected")}
                  disabled={loading}
                >
                  Reject Vendor
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => updateStatus("Approved")}
                  disabled={loading}
                >
                  Approve Vendor
                </Button>
              </>
            )}
            {vendor.vendorStatus === "Approved" && (
              <Button
                variant="destructive"
                onClick={() => updateStatus("Rejected")}
                disabled={loading}
              >
                Revoke Approval
              </Button>
            )}
            {vendor.vendorStatus === "Rejected" && (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => updateStatus("Approved")}
                disabled={loading}
              >
                Approve Vendor
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {viewImageURL && (
        <ViewImage
          url={viewImageURL}
          open={!!viewImageURL}
          onClose={() => setViewImageURL("")}
        />
      )}
    </>
  );
}
