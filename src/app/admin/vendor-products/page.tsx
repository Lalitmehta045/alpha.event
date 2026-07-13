"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { apiConnector } from "@/services/apiconnector";
import { adminEndpoints } from "@/services/api_endpoints";
import { Product } from "@/@types/product";
import { toast } from "react-toastify";
import Image from "next/image";
import { format } from "date-fns";
import { FiCheck, FiX, FiInfo, FiRefreshCw } from "react-icons/fi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const TABS = [
  { id: "all", label: "All Products" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

export default function VendorProductsPage() {
  const token = useSelector((state: RootState) => state.auth.token);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingProductId, setRejectingProductId] = useState<string | null>(
    null
  );
  const [rejectNote, setRejectNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [token, activeTab]);

  const fetchProducts = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const url =
        activeTab === "all"
          ? adminEndpoints.VENDOR_PRODUCTS_GET_API
          : `${adminEndpoints.VENDOR_PRODUCTS_GET_API}?status=${activeTab}`;

      const response = await apiConnector("GET", url, null, {
        Authorization: `Bearer ${token}`,
      });

      if (response.data?.success) {
        setProducts(response.data.data);
        if (response.data.counts) {
          setCounts(response.data.counts);
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch vendor products:", error);
      toast.error("Could not load vendor products");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!token) return;
    try {
      const response = await apiConnector(
        "PATCH",
        adminEndpoints.VENDOR_PRODUCT_PATCH_API(id),
        { action: "approve" },
        { Authorization: `Bearer ${token}` }
      );

      if (response.data?.success) {
        toast.success("Product approved successfully");
        // Optimistic update
        if (activeTab === "pending") {
          setProducts((prev) => prev.filter((p) => p._id !== id));
        } else {
          setProducts((prev) =>
            prev.map((p) =>
              p._id === id
                ? { ...p, status: "approved", publish: true, vendorNote: "" }
                : p
            )
          );
        }
        setCounts((prev) => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
          approved: prev.approved + 1,
        }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve product");
    }
  };

  const handleRevoke = async (id: string) => {
    if (!token) return;
    try {
      // We can use the 'reject' action without a note, or better yet, if we want to revert to pending we might need a new action.
      // But let's assume we can just reject it or re-review. Wait, the API only supports 'approve' or 'reject'.
      // If we revoke, it essentially becomes rejected. 
      // Let's use reject with note "Revoked by admin"
      const response = await apiConnector(
        "PATCH",
        adminEndpoints.VENDOR_PRODUCT_PATCH_API(id),
        { action: "reject", note: "Approval revoked by admin" },
        { Authorization: `Bearer ${token}` }
      );

      if (response.data?.success) {
        toast.success("Product approval revoked");
        if (activeTab === "approved") {
          setProducts((prev) => prev.filter((p) => p._id !== id));
        } else {
          setProducts((prev) =>
            prev.map((p) =>
              p._id === id
                ? {
                    ...p,
                    status: "rejected",
                    publish: false,
                    vendorNote: "Approval revoked by admin",
                  }
                : p
            )
          );
        }
        setCounts((prev) => ({
          ...prev,
          approved: Math.max(0, prev.approved - 1),
          rejected: prev.rejected + 1,
        }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to revoke approval");
    }
  };

  const openRejectModal = (id: string) => {
    setRejectingProductId(id);
    setRejectNote("");
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!token || !rejectingProductId) return;
    try {
      setSubmitting(true);
      const response = await apiConnector(
        "PATCH",
        adminEndpoints.VENDOR_PRODUCT_PATCH_API(rejectingProductId),
        { action: "reject", note: rejectNote },
        { Authorization: `Bearer ${token}` }
      );

      if (response.data?.success) {
        toast.success("Product rejected");
        if (activeTab === "pending" || activeTab === "approved") {
          setProducts((prev) => prev.filter((p) => p._id !== rejectingProductId));
        } else {
          setProducts((prev) =>
            prev.map((p) =>
              p._id === rejectingProductId
                ? {
                    ...p,
                    status: "rejected",
                    publish: false,
                    vendorNote: rejectNote || "Product rejected by admin",
                  }
                : p
            )
          );
        }
        
        // Update counts optimistically (rough estimation for UI)
        fetchProducts(); // Refresh counts properly in background
        setRejectModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject product");
    } finally {
      setSubmitting(false);
    }
  };

  const StatusBadge = ({ status }: { status?: string }) => {
    const colors = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      approved: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };
    const colorClass =
      colors[status as keyof typeof colors] ||
      "bg-gray-100 text-gray-700 border-gray-200";

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${colorClass}`}
      >
        {status || "Unknown"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Vendor Product Approvals
        </h1>
        <p className="text-gray-500 mt-1">
          Review and manage products submitted by vendors.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-xl w-fit shadow-sm border">
        {TABS.map((tab) => {
          let count = 0;
          if (tab.id === "all") count = counts.total;
          if (tab.id === "pending") count = counts.pending;
          if (tab.id === "approved") count = counts.approved;
          if (tab.id === "rejected") count = counts.rejected;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Product List */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-12 flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-gray-400 h-full">
            <p className="text-xl font-medium text-gray-500 mb-2">
              No products found
            </p>
            <p className="text-gray-400">
              There are no products in this category.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Product Name</th>
                  <th className="px-6 py-4 font-medium">Vendor</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product: any) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-lg border bg-gray-50 overflow-hidden shrink-0">
                          <Image
                            src={
                              product.thumbnails?.[0] ||
                              product.image?.[0] ||
                              "/assets/images/placeholder.jpg"
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1 max-w-[200px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {product.category?.[0]?.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {product.vendorId?.fname} {product.vendorId?.lname}
                        </span>
                        <span className="text-xs text-gray-500">
                          {product.vendorId?.email}
                        </span>
                        {product.vendorId?.businessName && (
                          <span className="text-xs text-indigo-600 font-medium">
                            {product.vendorId?.businessName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">
                        ₹{product.price}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={product.status} />
                      {product.status === "rejected" && product.vendorNote && (
                        <p className="text-xs text-red-500 mt-1 max-w-[150px] line-clamp-2" title={product.vendorNote}>
                          Note: {product.vendorNote}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {product.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(product._id)}
                              className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
                            >
                              <FiCheck /> Approve
                            </button>
                            <button
                              onClick={() => openRejectModal(product._id)}
                              className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
                            >
                              <FiX /> Reject
                            </button>
                          </>
                        )}
                        {product.status === "approved" && (
                          <button
                            onClick={() => handleRevoke(product._id)}
                            className="flex items-center gap-1 text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                          >
                            <FiX /> Revoke
                          </button>
                        )}
                        {product.status === "rejected" && (
                          <button
                            onClick={() => handleApprove(product._id)}
                            className="flex items-center gap-1 text-gray-500 hover:text-green-600 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                          >
                            <FiRefreshCw /> Approve Now
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Reason for Rejection (Optional)
              </label>
              <Textarea
                placeholder="Explain why this product is being rejected..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-gray-500">
                This note will be visible to the vendor.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setRejectModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={submitting}
              >
                {submitting ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
