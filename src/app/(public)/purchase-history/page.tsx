"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Package,
  Calendar,
  IndianRupee,
  Truck,
  CheckCircle,
  Clock, // Added Clock for PROCESSING status
  XCircle, // Added XCircle for CANCELLED status
  AlertCircle,
} from "lucide-react";
import LayoutV1 from "../layout/layoutV1";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { getAllOrders } from "@/services/operations/orders";
import toast from "react-hot-toast";
import { TbFileInvoice } from "react-icons/tb";

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  _id: string;
  totalAmount: number;
  status: "PROCESSING" | "REQUEST" | "ACCEPTED" | "CANCELLED";
  createdAt: string;
  paymentMethod: string;
  items: OrderItem[];
  orderId: string | any;
}

export default function PurchaseHistoryPage() {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  // ⭐ 1. Use Redux state for the list of orders
  const reduxOrders = useSelector((state: RootState) => state.order.allOrders);

  // ⭐ 2. Local state for loading is fine
  const [loading, setLoading] = useState(true); // Set to true to show skeleton initially

  // Function to transform the server data structure (OrderType) to the component's (Order)
  const formatOrdersForComponent = (serverOrders: any[]): Order[] => {
    if (!serverOrders || serverOrders.length === 0) return [];

    return serverOrders.map((order) => ({
      _id: order._id,
      orderId: order.orderId,
      totalAmount: order.totalAmt, // Use totalAmt from server
      status: order.order_status.toUpperCase() as Order["status"], // Convert status to component's expected CAPS format
      createdAt: order.createdAt,
      paymentMethod: order.payment_status, // Use payment_status from server
      items: order.products.map((p: any) => ({
        productName:
          p.productId?.name || p.product_details?.name || "Unknown Item",
        quantity: p.quantity,
        price: p.productId?.price || 0,
        image: p.productId?.image?.[0] || "https://via.placeholder.com/150",
      })),
    }));
  };

  const downloadInvoice = () => {
    const blob = new Blob(["Invoice coming soon..."], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "invoice.txt";
    link.click();
  };

  const fetchOrders = async () => {
    if (!token) {
      toast.error("Please login first.");
      return;
    }
    setLoading(true); // ⭐ Set loading true when starting fetch
    try {
      // The service call updates Redux automatically
      await getAllOrders(token, dispatch);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false); // ⭐ Set loading false when fetch finishes (success or failure)
    }
  };

  useEffect(() => {
    // ⭐ Fetch data on mount
    fetchOrders();
  }, [token]);

  // ⭐ 3. Format Redux data for display
  const orders = formatOrdersForComponent(reduxOrders || []);

  const getStatusStyle = (status: Order["status"]) => {
    switch (status) {
      case "PROCESSING":
        return {
          color: "bg-yellow-500 text-white border-yellow-500",
          icon: <Clock size={16} className="mr-1" />,
        };
      case "REQUEST":
        return {
          color: "bg-blue-500 text-white border-blue-500",
          icon: <AlertCircle size={16} className="mr-1" />,
        };
      case "ACCEPTED":
        return {
          color: "bg-green-600 text-white border-green-600",
          icon: <CheckCircle size={16} className="mr-1" />,
        };
      case "CANCELLED":
        return {
          color: "bg-red-600 text-white border-red-600",
          icon: <XCircle size={16} className="mr-1" />,
        };
      default:
        return {
          color: "bg-gray-500 text-white border-gray-500",
          icon: <Package size={16} className="mr-1" />,
        };
    }
  };

  if (loading)
    return (
      <div className="p-6 grid gap-4 max-w-4xl mx-auto">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );

  return (
    <div className="relative w-full h-min bg-gray-100 font-sans">
      <LayoutV1>
        <main className="w-11/12 mx-auto px-2 sm:px-4 md:px-6 mt-20 md:mt-24 py-10 flex flex-col gap-6">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-gray-800 border-b pb-2 mb-4 flex items-center gap-3"
          >
            <Package className="w-8 h-8 text-indigo-600" />
            Purchase History
          </motion.h1>

          <div className="w-full grid md:grid-cols-2 gap-6 mx-auto">
            {orders.length === 0 && (
              <Card className="p-8 text-center bg-white shadow-lg border-2 border-dashed border-gray-300">
                <p className="text-xl text-gray-500">
                  <Package className="w-6 h-6 inline-block mr-2" />
                  You haven't placed any orders yet.
                </p>
              </Card>
            )}

            {orders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Amazing Card Design border-indigo-500*/}
                <Card
                  className={`w-full max-w-full mx-auto shadow-2xl gap-0 border-l-4 border-${
                    getStatusStyle(order.status).color
                  } rounded-xl hover:shadow-indigo-200 transition-all duration-300 hover:scale-[1.01]`}
                >
                  <CardHeader className="p-4 sm:p-6 pb-3 bg-indigo-50 border-b border-indigo-100">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      {/* Order Title */}
                      <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
                        Order{" "}
                        <span className="text-indigo-600 uppercase">
                          {/* #{order._id.toString().slice(-6).toUpperCase()} */}
                          #{order.orderId}
                        </span>
                      </CardTitle>

                      {/* Status Badge */}
                      <Badge
                        className={`px-3 py-1 text-sm font-semibold rounded-full flex items-center ${
                          getStatusStyle(order.status).color
                        }`}
                      >
                        {getStatusStyle(order.status).icon}
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-2 sm:p-4 space-y-6">
                    {/* Order Info Grid - Responsive columns */}
                    <div className="grid grid-cols-4 gap-4 text-sm text-gray-600 border-b pb-4 order-info-grid">
                      {/* Date */}
                      <p className="flex items-center gap-2 font-medium">
                        <Calendar size={18} className="text-indigo-500" />
                        Date:
                        <span className="font-semibold text-gray-800">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </p>

                      {/* Total */}
                      <p className="flex items-center gap-2 font-medium">
                        <IndianRupee size={18} className="text-green-600" />
                        Total:
                        <span className="font-extrabold text-green-700">
                          ₹{order.totalAmount.toFixed(2)}
                        </span>
                      </p>

                      {/* Paid Via */}
                      <p className="flex items-center gap-2 font-medium">
                        <Truck size={18} className="text-orange-500" />
                        Paid Via:
                        <span className="font-semibold text-gray-800">
                          {order.paymentMethod}
                        </span>
                      </p>

                      {order.status === "ACCEPTED" && (
                        <p className="flex items-center gap-2 text-green-600 font-bold col-span-2 md:col-span-1">
                          <CheckCircle size={18} /> Delivery Confirmed
                        </p>
                      )}

                      {/* Invoice Button */}
                      <button
                        onClick={() => downloadInvoice}
                        className="px-4 py-1.5 w-max flex gap-2 text-sm font-semibold bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all"
                      >
                        <TbFileInvoice className="w-5 h-5" />
                        Invoice
                      </button>
                    </div>

                    {/* Items List */}
                    <div className="space-y-4 flex flex-col">
                      <h3 className="text-base font-semibold text-gray-800">
                        Items Ordered:
                      </h3>

                      <div className="w-full space-y-2 flex flex-1 flex-wrap justify-start items-start mx-auto gap-3 items-grid">
                        {order.items.map((item, i) => (
                          <div
                            className="w-full mx-auto sm:mx-0 max-w-44 sm:max-w-40 md:max-w-36 lg:max-w-44 xl:max-w-max h-max flex flex-col justify-start gap-2 p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200 transition-shadow duration-200 hover:shadow-md order-item-card"
                            key={i}
                          >
                            {/* Item Image */}
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-28 h-28 sm:w-24 sm:h-24 rounded-md mx-auto object-cover border border-gray-300"
                            />

                            {/* Product Details */}
                            <div className="flex flex-col w-max h-12">
                              <p className="font-semibold text-wrap text-gray-800 over-hidden">
                                {item.productName.length > 25
                                  ? `lg:${item.productName.substring(0, 25)}...`
                                  : item.productName}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-500">
                                Qty:{" "}
                                <span className="font-medium text-gray-700">
                                  {item.quantity}
                                </span>
                              </p>
                            </div>

                            {/* Item Price */}
                            <p className="font-bold text-base text-gray-800 min-w-max">
                              ₹{item.price.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </main>
      </LayoutV1>
    </div>
  );
}
