"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IndianRupee,
  MapPin,
  User,
  Package,
  Clock,
  ShoppingCart,
  Loader2,
  Save,
  RotateCcw,
  CalendarDays,
} from "lucide-react";
// Assuming standard component imports
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { OrderStatusBadge } from "@/components/admin/orders/order-status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import {
  getAdminOrderDetail,
  updateAdminOrderStatus,
} from "@/services/operations/orders";
// import { updateAdminOrderStatus } from "@/services/operations/orders"; // Actual service call
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { useParams } from "next/navigation";
import { DetailedOrderData } from "@/@types/order";

// Placeholder types if not available from the commented import
type OrderData = DetailedOrderData;
interface DeliveryAddress {
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  mobile: string;
}
const ORDER_STATUSES = ["Processing", "Request", "Accepted", "Cancelled"];

export default function ViewOrderPage() {
  const token = useSelector((state: RootState) => state.auth.token);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ⭐ NEW STATE for editable status
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const params = useParams();
  const orderId: any = params.id;

  const getDiscountedPrice = (price: number, discount: number) => {
    return price * (1 - discount / 100);
  };

  const fetchOrderDetail = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Assuming getAdminOrderDetail returns DetailedOrderData
      const resOrderdetail = await getAdminOrderDetail(orderId, token);

      if (resOrderdetail) {
        setOrder(resOrderdetail as OrderData);
        // ⭐ Initialize currentStatus when the order data is fetched
        setCurrentStatus(resOrderdetail.order_status);
      } else {
        setOrder(null);
        setError(
          "Failed to fetch order details. Please check console for more info."
        );
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      toast.error("An unexpected error occurred while loading data.");
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [orderId, token]);

  // ⭐ NEW HANDLER: Function to save the updated status
  const handleSaveStatus = async () => {
    if (!order || currentStatus === order.order_status || isUpdatingStatus)
      return;
    if (!token) {
      setLoading(false);
      return;
    }

    console.log("order id: ", order);

    setIsUpdatingStatus(true);
    toast.loading("Updating order status...", { id: "statusUpdate" });

    try {
      // ⭐ REPLACE with your actual API call
      const res = await updateAdminOrderStatus(order._id, currentStatus, token);

      if (res && res.success) {
        // ⭐ Update the main order state to reflect the change
        setOrder((prev) =>
          prev ? { ...prev, order_status: currentStatus } : null
        );
        toast.success(`Status updated to ${currentStatus}!`, {
          id: "statusUpdate",
        });
      } else {
        toast.error("Failed to update status on server.", {
          id: "statusUpdate",
        });
        setCurrentStatus(order.order_status);
      }
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("An error occurred during status update.", {
        id: "statusUpdate",
      });
      setCurrentStatus(order.order_status); // Revert on client-side error
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // ⭐ NEW HANDLER: Function to revert the status
  const handleRevertStatus = () => {
    if (order) {
      setCurrentStatus(order.order_status);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const formatAddress = (addr: DeliveryAddress) => {
    return [
      addr.address_line,
      addr.city,
      addr.state,
      addr.pincode,
      addr.country,
    ]
      .filter(Boolean)
      .join(", ");
  };

  // --------------------------------------------------------------------------
  // --- LOADING/ERROR UI (No change) ---
  // --------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-700" />
        <span className="ml-4 text-xl font-semibold text-gray-700">
          Loading Order {orderId}...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center text-xl text-red-700 font-bold bg-red-50 border-t-4 border-red-500 rounded-md m-8">
        Error: {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center text-xl text-gray-700 font-medium m-8">
        Order details are not available for ID: {orderId}.
      </div>
    );
  }

  // Check if the current status differs from the saved status
  const isStatusDirty = currentStatus !== order.order_status;
  const isStatusLoading = isUpdatingStatus || loading;

  // --------------------------------------------------------------------------
  // --- MAIN ORDER DETAIL UI (Updated Header for Editability) ---
  // --------------------------------------------------------------------------

  return (
    <div className="p-1.5 sm:p-2 space-y-8 max-w-full mx-auto min-h-screen">
      {/* 1. HEADER (Made fully responsive for stacking controls) */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 flex items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
          <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
          Order Details: #{order.orderId}
        </h1>

        {/* EDITABLE STATUS BLOCK */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <p className="text-xs font-medium text-gray-500 hidden sm:block">
            Placed on: {new Date(order.createdAt).toLocaleString()}
          </p>

          {/* Status Dropdown */}
          <Select
            onValueChange={setCurrentStatus}
            value={currentStatus}
            disabled={isStatusLoading}
          >
            <SelectTrigger className="w-full sm:w-max font-semibold">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Action Buttons: Use flex-grow for full width on mobile */}
          <div className="flex gap-2 w-full sm:w-auto">
            {isStatusDirty && (
              <>
                <Button
                  onClick={handleSaveStatus}
                  disabled={isStatusLoading}
                  className="bg-green-600 hover:bg-green-700 text-white grow sm:grow-0"
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save
                </Button>
                <Button
                  onClick={handleRevertStatus}
                  disabled={isStatusLoading}
                  variant="outline"
                  className="text-gray-600"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Display static badge if not editing or status is saved */}
            {!isStatusDirty && <OrderStatusBadge status={order.order_status} />}
          </div>
        </div>
      </header>

      {/* --- Main Content Grid --- */}
      {/* Adjust the grid columns for smaller screens to ensure stacking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* === LEFT COLUMN (Order & Customer Details) === */}
        <div className="lg:col-span-2 space-y-6">
          {/* 2. Products List */}
          <Card className="gap-2 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-indigo-500">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <Package className="h-6 w-6 text-indigo-600" /> Order Items (
                {order.products.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {/* DESKTOP TABLE VIEW (Visible sm and up) */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="w-[100px]">Product</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.products.map((item: any) => {
                      const p = item.productId;
                      const discountedPrice = getDiscountedPrice(
                        p.price,
                        p.discount
                      );
                      const total = discountedPrice * item.quantity;

                      return (
                        <TableRow
                          key={item._id}
                          className="hover:bg-indigo-50/50"
                        >
                          <TableCell>
                            <img
                              src={p.image[0] || "/placeholder.png"}
                              alt={p.name}
                              className="w-16 h-16 object-cover rounded-md shadow-sm"
                            />
                          </TableCell>
                          <TableCell className="font-semibold text-gray-800">
                            {p.name}
                            {p.discount > 0 && (
                              <span className="block text-xs text-red-600 font-medium">
                                {p.discount}% Discount
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 flex items-center pt-5">
                            <IndianRupee
                              size={12}
                              className="mr-1 text-gray-500"
                            />
                            {discountedPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="font-medium align-text-top">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right text-lg font-bold text-indigo-700 flex items-center justify-end">
                            <IndianRupee size={14} className="mr-1" />
                            {total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* MOBILE LIST VIEW (Hidden sm and up) */}
              <div className="sm:hidden p-4 space-y-4">
                {order.products.map((item: any) => {
                  const p = item.productId;
                  const discountedPrice = getDiscountedPrice(
                    p.price,
                    p.discount
                  );
                  const total = discountedPrice * item.quantity;

                  return (
                    <div
                      key={item._id}
                      className="border-b pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex gap-3">
                        <img
                          src={p.image[0] || "/placeholder.png"}
                          alt={p.name}
                          className="w-16 h-16 object-cover rounded-md shadow-sm shrink-0"
                        />
                        <div className="grow">
                          <p className="font-semibold text-gray-800 text-base line-clamp-2">
                            {p.name}
                          </p>
                          {p.discount > 0 && (
                            <span className="text-xs text-red-600 font-medium">
                              {p.discount}% Discount
                            </span>
                          )}
                          <p className="text-sm text-gray-600 mt-1">
                            Qty:{" "}
                            <span className="font-medium">{item.quantity}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-100">
                        <div className="text-sm text-gray-500 flex items-center">
                          Price:
                          <IndianRupee size={12} className="ml-1 mr-0.5" />
                          {discountedPrice.toFixed(2)}
                        </div>
                        <p className="text-lg font-bold text-indigo-700 flex items-center">
                          <IndianRupee size={14} className="mr-1" />
                          {total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 3. Customer Details (Adjusted for better mobile padding) */}
          <Card className="gap-2 shadow-lg transition-shadow border-l-4 border-blue-500">
            <CardHeader className="bg-blue-50/50 border-b">
              <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <User className="h-6 w-6 text-blue-600" /> Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Full Name
                </p>
                <p className="font-extrabold text-gray-900">
                  {order.userId.fname} {order.userId.lname}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                <p className="font-semibold text-gray-700">
                  {order.userId.email}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                <p className="font-semibold text-gray-700">
                  {order.userId.phone}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  User Role
                </p>
                <p className="font-semibold text-gray-700 uppercase">
                  {order.userId.role}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* === RIGHT COLUMN (Summary & Address) === */}
        {/* These cards will naturally stack below the left column on small screens */}
        <div className="lg:col-span-1 space-y-6">
          {/* 4. Financial Summary (Adjusted Title size) */}
          <Card className="gap-2 shadow-lg transition-shadow border-t-4 border-green-500">
            <CardHeader className="bg-green-50/50 border-b">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />{" "}
                Payment & Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium text-sm">
                  Subtotal (before discount)
                </span>
                <span className="font-medium text-gray-700 flex items-center text-sm">
                  <IndianRupee size={12} className="mr-1" />
                  {order.subTotalAmt.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-green-700">
                <span className="font-extrabold text-sm">
                  Total Discount Applied
                </span>
                <span className="font-extrabold flex items-center text-sm">
                  <IndianRupee size={12} className="mr-1" />
                  {(order.subTotalAmt - order.totalAmt).toFixed(2)}
                </span>
              </div>

              <Separator className="my-2 bg-gray-300" />

              <div className="flex justify-between items-center text-lg font-bold pt-2">
                <span className="text-base">Total Amount Paid</span>
                <span className="text-2xl text-indigo-700 flex items-center">
                  <IndianRupee size={16} className="mr-1" />
                  {order.totalAmt.toFixed(2)}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">Payment Status</p>
                <p
                  className={`font-extrabold text-base uppercase ${
                    order.payment_status === "Paid"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {order.payment_status}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 5. Shipping Address (Adjusted Title size and padding) */}
          <Card className="gap-2 shadow-lg transition-shadow border-l-4 border-orange-500">
            <CardHeader className="bg-orange-50/50 border-b">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />{" "}
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <p className="text-base font-semibold leading-relaxed text-gray-800">
                {formatAddress(order.delivery_address)}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Contact Mobile: {order.delivery_address.mobile}
              </p>
            </CardContent>
          </Card>

          {/* 6. Delivery Date */}
          <Card className="gap-2 shadow-lg transition-shadow border-r-4 border-purple-400">
            <CardHeader className="bg-purple-50/50 border-b">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />{" "}
                Preferred Delivery Date
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {order.deliveryDate ? (
                <div className="text-base font-semibold text-gray-800">
                  {new Date(order.deliveryDate).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              ) : (
                <div className="text-base text-gray-500 italic">
                  No delivery date specified
                </div>
              )}
            </CardContent>
          </Card>

          {/* 7. Timeline (Adjusted Title size and padding) */}
          <Card className="gap-2 shadow-lg transition-shadow border-r-4 border-gray-400">
            <CardHeader className="bg-gray-100/50 border-b">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" /> Order
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-500">Created At:</p>
                <p className="text-sm font-semibold text-gray-700 text-right">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-500">
                  Last Update:
                </p>
                <p className="text-sm font-semibold text-gray-700 text-right">
                  {new Date(order.updatedAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
