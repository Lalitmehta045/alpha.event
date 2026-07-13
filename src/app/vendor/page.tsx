"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { apiConnector } from "@/services/apiconnector";
import { vendorEndpoints } from "@/services/api_endpoints";
import { FiPackage, FiClock, FiCheckCircle, FiPlus } from "react-icons/fi";
import Image from "next/image";
import { Product } from "@/@types/product";
import { toast } from "react-toastify";
import { format } from "date-fns";

export default function VendorDashboard() {
  const token = useSelector((state: RootState) => state.auth.token);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const response = await apiConnector(
          "GET",
          vendorEndpoints.VENDOR_PRODUCTS_GET_API,
          null,
          { Authorization: `Bearer ${token}` }
        );

        if (response.data?.success) {
          setStats(response.data.counts);
          setRecentProducts(response.data.data.slice(0, 5)); // Last 5
        }
      } catch (error: any) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Could not load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const StatusBadge = ({ status }: { status?: string }) => {
    const colors = {
      pending: "bg-amber-100 text-amber-700 border-amber-200",
      approved: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };
    const colorClass =
      colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700 border-gray-200";

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${colorClass}`}
      >
        {status || "Unknown"}
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back! Here's an overview of your products.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 bg-gray-200 animate-pulse rounded-2xl"
              ></div>
            ))}
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl">
                <FiPackage />
              </div>
              <div>
                <p className="text-gray-500 font-medium">Total Submitted</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-2xl">
                <FiClock />
              </div>
              <div>
                <p className="text-gray-500 font-medium">Pending Approval</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl">
                <FiCheckCircle />
              </div>
              <div>
                <p className="text-gray-500 font-medium">Approved & Live</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.approved}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link
          href="/vendor/upload-product"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm"
        >
          <FiPlus /> Upload New Product
        </Link>
        <Link
          href="/vendor/my-products"
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl border transition-colors shadow-sm"
        >
          View My Products
        </Link>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">Recent Submissions</h2>
        </div>

        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
          </div>
        ) : recentProducts.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-gray-400">
            <FiPackage className="text-6xl mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-500 mb-4">
              No products yet
            </p>
            <Link
              href="/vendor/upload-product"
              className="text-amber-500 hover:text-amber-600 font-medium"
            >
              Upload your first product →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Date Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded border bg-gray-50 overflow-hidden shrink-0">
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
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {product.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      ₹{product.price}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {product.createdAt
                        ? format(new Date(product.createdAt), "dd MMM yyyy")
                        : "N/A"}
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
