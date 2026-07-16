"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FiPackage, FiPhone, FiMail, FiUser, FiHome } from "react-icons/fi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";

interface VendorInfo {
  _id: string;
  fname: string;
  lname: string;
  email: string;
  businessName: string;
  businessPhone: string;
  phone: string;
}

interface VendorProduct {
  productId: {
    _id: string;
    name: string;
    image: string[];
    price: number;
    vendorId: VendorInfo;
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

export default function AdminVendorOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("All Vendors");

  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/admin/vendor-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          const normalizedOrders = data.data.map((order: Order) => {
            let status = order.order_status;
            if (status === "Request") status = "Pending";
            if (status === "Accepted") status = "Delivered";
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

  // Extract unique vendor names for tabs
  const getVendorName = (vendor: VendorInfo) => {
    return vendor.businessName || `${vendor.fname} ${vendor.lname}`;
  };

  const vendors = Array.from(new Set(
    orders.flatMap(o => o.products.map(p => getVendorName(p.productId.vendorId)))
  )).sort();

  const tabs = ["All Vendors", ...vendors];

  const filteredOrders = orders.filter((o) => {
    if (activeTab === "All Vendors") return true;
    return o.products.some(p => getVendorName(p.productId.vendorId) === activeTab);
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

  const calculateEarnings = (products: VendorProduct[], filterVendor?: string) => {
    return products.reduce((acc, p) => {
      if (filterVendor && getVendorName(p.productId.vendorId) !== filterVendor) return acc;
      return acc + (p.productId?.price || 0) * p.quantity;
    }, 0);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Vendor Orders</h1>
        <p className="text-gray-500 mt-1">All orders containing vendor products</p>
      </div>

      <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-colors ${
              activeTab === tab ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white border border-gray-200 rounded-xl animate-pulse"></div>
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
          <h3 className="text-lg font-semibold text-gray-900">No vendor orders found</h3>
          <p className="text-gray-500 mt-1">There are no orders matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            // Group products by vendor for this order
            const vendorGroups = order.products.reduce((acc, product) => {
              const vendor = product.productId.vendorId;
              const vName = getVendorName(vendor);
              if (!acc[vName]) acc[vName] = { vendor, products: [] };
              acc[vName].products.push(product);
              return acc;
            }, {} as Record<string, { vendor: VendorInfo; products: VendorProduct[] }>);

            // Filter groups if a specific vendor tab is active
            const displayGroups = activeTab === "All Vendors" 
              ? Object.values(vendorGroups) 
              : [vendorGroups[activeTab]].filter(Boolean);

            return (
              <div key={order._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="border-b border-gray-100 p-4 bg-gray-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-gray-900">Order #{order.orderId?.slice(-8)}</span>
                      {getStatusBadge(order.order_status)}
                    </div>
                    <p className="text-xs text-gray-500">
                      Placed: {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Left Column: Vendor and Customer info */}
                  <div className="space-y-6 lg:col-span-1 border-b lg:border-b-0 lg:border-r border-gray-100 pb-6 lg:pb-0 lg:pr-6">
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
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
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <FiHome /> Delivery Address
                      </h3>
                      <div className="text-sm text-gray-600 space-y-0.5">
                        <p>{order.delivery_address?.street}</p>
                        <p>{order.delivery_address?.city}, {order.delivery_address?.state} - {order.delivery_address?.pincode}</p>
                        {order.delivery_address?.landmark && <p>Landmark: {order.delivery_address.landmark}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Vendor groups */}
                  <div className="lg:col-span-3 space-y-6">
                    {displayGroups.map((group, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4 border-b border-gray-200 pb-3">
                          <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                              <FiPackage /> Vendor
                            </h3>
                            <p className="font-bold text-gray-900">{getVendorName(group.vendor)}</p>
                            <div className="flex flex-wrap gap-3 mt-1">
                              <a href={`tel:${group.vendor.businessPhone || group.vendor.phone}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                <FiPhone className="w-3 h-3" /> {group.vendor.businessPhone || group.vendor.phone}
                              </a>
                              <a href={`mailto:${group.vendor.email}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                <FiMail className="w-3 h-3" /> {group.vendor.email}
                              </a>
                            </div>
                          </div>
                          <div className="text-left sm:text-right bg-white px-3 py-2 rounded-md shadow-sm border border-gray-200">
                            <p className="text-xs font-medium text-gray-500 uppercase">Vendor Earnings</p>
                            <p className="text-lg font-bold text-green-600">₹{calculateEarnings(group.products)}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {group.products.map((p, pIdx) => (
                            <div key={pIdx} className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden shrink-0 relative">
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
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
