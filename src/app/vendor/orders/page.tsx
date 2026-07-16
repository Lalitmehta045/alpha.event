"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FiPackage, FiPhone, FiMail, FiUser } from "react-icons/fi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";

interface VendorProduct {
  productId: {
    _id: string;
    name: string;
    image: string[];
    price: number;
    vendorId: string;
  };
  quantity: number;
  product_details: {
    name: string;
    image: string[];
  };
}

interface Order {
  _id: string;
  orderId: string;
  userId: {
    _id: string;
    fname: string;
    lname: string;
    email: string;
    phone: string;
  };
  products: VendorProduct[];
  delivery_address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  order_status: "Pending" | "Processing" | "Accepted" | "Cancelled" | "Request" | "Delivered";
  createdAt: string;
}

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("All");

  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/vendor/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          // Normalize "Request" and "Accepted" if we want to show standard statuses
          const normalizedOrders = data.data.map((order: Order) => {
            let status = order.order_status;
            // Depending on how backend handles order_status
            // e.g., Request -> Pending, Processing -> Processing, Accepted -> Delivered
            if (status === "Request") status = "Pending";
            if (status === "Accepted") status = "Delivered"; // Map to Delivered as requested
            return { ...order, order_status: status };
          });
          setOrders(normalizedOrders);
        } else {
          setError(data.error || "Failed to fetch orders");
        }
      } catch (err) {
        setError("Network error fetching orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const tabs = ["All", "Pending", "Processing", "Delivered", "Cancelled"];

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "All") return true;
    return o.order_status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Pending</span>;
      case "Processing":
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Processing</span>;
      case "Delivered":
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Delivered</span>;
      case "Cancelled":
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const calculateEarnings = (products: VendorProduct[]) => {
    return products.reduce((acc, p) => acc + (p.productId?.price || 0) * p.quantity, 0);
  };

  const pendingCount = orders.filter((o) => o.order_status === "Pending").length;
  const deliveredCount = orders.filter((o) => o.order_status === "Delivered").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Product Orders</h1>
        <p className="text-gray-500 mt-1">Orders containing your products</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-full text-gray-500">
            <FiPackage className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-full text-amber-500">
            <FiPackage className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Delivered</p>
            <p className="text-2xl font-bold text-gray-900">{deliveredCount}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-full text-green-500">
            <FiPackage className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-colors ${
              activeTab === tab ? "bg-[#1a0a00] text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-white border border-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          <p className="font-semibold">{error}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiPackage className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No orders found</h3>
          <p className="text-gray-500 mt-1">No orders yet for your products in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="border-b border-gray-100 p-4 bg-gray-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-gray-900">Order #{order.orderId?.slice(-8)}</span>
                    {getStatusBadge(order.order_status)}
                  </div>
                  <p className="text-xs text-gray-500">Placed: {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500">Your Earnings</p>
                  <p className="text-lg font-bold text-green-600">₹{calculateEarnings(order.products)}</p>
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4 lg:col-span-2">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Your Products in this Order</h3>
                    <div className="space-y-3">
                      {order.products.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative">
                            {p.productId?.image?.[0] ? (
                              <Image src={p.productId.image[0]} alt={p.productId.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <FiPackage />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 line-clamp-1">{p.productId?.name || "Unknown Product"}</p>
                            <p className="text-sm text-gray-500">
                              Qty: {p.quantity} &times; ₹{p.productId?.price || 0} = <span className="font-medium text-gray-700">₹{(p.productId?.price || 0) * p.quantity}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 lg:border-l lg:border-gray-100 lg:pl-6">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FiUser /> Customer Details
                    </h3>
                    <p className="font-semibold text-gray-900">{order.userId?.fname} {order.userId?.lname}</p>
                    <a href={`mailto:${order.userId?.email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                      <FiMail className="w-3 h-3" /> {order.userId?.email}
                    </a>
                    {order.userId?.phone && (
                      <a href={`tel:${order.userId?.phone}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-1">
                        <FiPhone className="w-3 h-3" /> {order.userId?.phone}
                      </a>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Delivery Address</h3>
                    <div className="text-sm text-gray-600 space-y-0.5">
                      <p>{order.delivery_address?.street}</p>
                      <p>{order.delivery_address?.city}, {order.delivery_address?.state} - {order.delivery_address?.pincode}</p>
                      {order.delivery_address?.landmark && <p>Landmark: {order.delivery_address.landmark}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
