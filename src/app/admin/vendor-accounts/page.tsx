"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import { toast } from "react-toastify";
import ViewVendorDialog from "@/components/admin/vendors/view-vendor-dialog";

export default function VendorAccountsPage() {
  const token = useSelector((state: RootState) => state.auth.token);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusTab, setStatusTab] = useState("Pending_Review");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchVendors = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/admin/vendor-accounts?status=${statusTab}&search=${encodeURIComponent(
          debouncedSearch
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        setVendors(res.data.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch vendors", error);
      toast.error(error.response?.data?.message || "Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [token, statusTab, debouncedSearch]);

  const handleReview = (vendor: any) => {
    setSelectedVendor(vendor);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Vendor Accounts</h1>
        <div className="w-1/3">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex space-x-4 mb-4">
        {["Pending_Review", "Approved", "Rejected"].map((status) => (
          <button
            key={status}
            className={`px-4 py-2 font-medium rounded-md transition-colors ${
              statusTab === status
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setStatusTab(status)}
          >
            {status.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Vendor Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <ClipLoader size={30} color="#4f46e5" />
                </TableCell>
              </TableRow>
            ) : vendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-gray-500 font-medium">
                  No {statusTab.replace("_", " ").toLowerCase()} vendors found.
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor: any) => (
                <TableRow key={vendor._id}>
                  <TableCell className="font-medium">
                    {vendor.fname} {vendor.lname}
                  </TableCell>
                  <TableCell>{vendor.email}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        vendor.vendorStatus === "Pending_Review"
                          ? "bg-amber-100 text-amber-700"
                          : vendor.vendorStatus === "Approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {vendor.vendorStatus.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReview(vendor)}
                    >
                      {vendor.vendorStatus === "Pending_Review" ? "Review" : "View"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isDialogOpen && selectedVendor && (
        <ViewVendorDialog
          open={isDialogOpen}
          vendor={selectedVendor}
          token={token!}
          onOpenChange={setIsDialogOpen}
          fetchVendors={fetchVendors}
        />
      )}
    </div>
  );
}
