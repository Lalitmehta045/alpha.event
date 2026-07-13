"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { apiConnector } from "@/services/apiconnector";
import { vendorEndpoints } from "@/services/api_endpoints";
import { Product } from "@/@types/product";
import { toast } from "react-toastify";
import Image from "next/image";
import { format } from "date-fns";
import { FiPackage, FiInfo, FiTrash2 } from "react-icons/fi";

const TABS = [
  { id: "all", label: "All Products" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

export default function MyProductsPage() {
  const token = useSelector((state: RootState) => state.auth.token);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, [token, activeTab]);

  const fetchProducts = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const url =
        activeTab === "all"
          ? vendorEndpoints.VENDOR_PRODUCTS_GET_API
          : `${vendorEndpoints.VENDOR_PRODUCTS_GET_API}?status=${activeTab}`;

      const response = await apiConnector("GET", url, null, {
        Authorization: `Bearer ${token}`,
      });

      if (response.data?.success) {
        setProducts(response.data.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch products:", error);
      toast.error("Could not load products");
    } finally {
      setLoading(false);
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

    let text = status || "Unknown";
    if (status === "pending") text = "Waiting for admin approval";
    if (status === "approved") text = "Live on website";
    if (status === "rejected") text = "Rejected";

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}
      >
        {text}
      </span>
    );
  };

  const handleResubmit = async (id: string) => {
    if (!token) return;
    try {
      const response = await apiConnector(
        "PATCH",
        `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/vendor/product/${id}`,
        {},
        { Authorization: `Bearer ${token}` }
      );
      if (response.data?.success) {
        toast.success("Product resubmitted successfully for review");
        fetchProducts(); // Refresh list to update status
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resubmit product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    
    try {
      const response = await apiConnector(
        "DELETE",
        `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/vendor/product/${id}`,
        null,
        { Authorization: `Bearer ${token}` }
      );
      if (response.data?.success) {
        toast.success("Product deleted successfully");
        fetchProducts(); // Refresh list after deletion
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
        <p className="text-gray-500 mt-1">
          Manage your uploaded products and check their approval status.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-amber-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-12 flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-gray-400 h-full">
            <FiPackage className="text-6xl mb-4 text-gray-300" />
            <p className="text-xl font-medium text-gray-500 mb-2">
              No products found
            </p>
            <p className="text-gray-400">
              {activeTab === "all"
                ? "You haven't uploaded any products yet."
                : `You don't have any ${activeTab} products.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Product Name</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Admin Notes</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
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
                          <p className="font-semibold text-gray-900 line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Stock: {product.stock} {product.unit}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">
                          {product.category?.[0]?.name || "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {product.subCategory?.[0]?.name || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          ₹{product.price}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-xs text-green-600 font-medium">
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                      {product.createdAt
                        ? format(new Date(product.createdAt), "dd MMM yyyy")
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {product.status === "rejected" && product.vendorNote ? (
                        <div className="space-y-3">
                          <div className="flex items-start gap-2 bg-red-50 text-red-700 p-2 rounded-lg border border-red-100 max-w-xs">
                            <FiInfo className="mt-0.5 shrink-0" />
                            <p className="text-xs leading-relaxed">
                              {product.vendorNote}
                            </p>
                          </div>
                          <button
                            onClick={() => handleResubmit(product._id)}
                            className="text-xs font-semibold bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition shadow-sm w-full"
                          >
                            Edit & Resubmit
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <FiTrash2 className="text-lg" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
