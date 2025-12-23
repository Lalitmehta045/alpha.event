"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { OrderStatusBadge } from "./order-status-badge";
import { Button } from "@/components/ui/button";
import {
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  User,
  ShoppingCart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import OrderTableSkeleton from "@/app/admin/orders/OrderTableSkeleton";
import OrderMobileSkeleton from "@/app/admin/orders/OrderMobileSkeleton";

// --- Order Data Structure (Refined) ---
interface OrderData {
  _id: string;
  orderId: string;
  totalAmt: number;
  createdAt: Date;
  order_status: string;
  products: { quantity: number; [key: string]: any }[];
  userId: {
    fname: string;
    lname: string;
    email: string;
  };
}

// --- Props Interface ---
interface OrdersTableProps {
  orders: OrderData[]; // ⭐ Removed '| any' for cleaner typing
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
}

// Helper functions (retained)
const getTotalItems = (products: any[]) => {
  if (!Array.isArray(products)) return 0;
  return products.reduce((sum, p) => sum + p.quantity, 0);
};

const getFullName = (user: OrderData["userId"]) => {
  return `${user?.fname || ""} ${user?.lname || ""}`;
};

export function OrdersTable({
  orders,
  loading,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
}: OrdersTableProps) {
  const router = useRouter();

  const handleViewOrder = (orderId: string) => {
    router.push(`/admin/orders/view-order/${orderId}`);
  };

  return (
    <div className="md:border rounded-lg md:shadow-xl">
      {/* 1. Desktop Table View (Visible on sm and up) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="border-b bg-muted/40">
            <tr className="text-left text-sm text-gray-700">
              <th className="p-4 min-w-[120px]">Order ID</th>
              <th className="p-4 min-w-[200px]">Customer</th>
              <th className="p-4 min-w-[150px]">Date</th>
              <th className="p-4">Items</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right min-w-20">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <OrderTableSkeleton />
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-6 font-semibold text-gray-700"
                >
                  No orders found matching the filters.
                </td>
              </tr>
            ) : (
              orders.map((o: OrderData) => (
                <tr
                  key={o._id}
                  className="border-b hover:bg-muted/30 transition text-sm"
                >
                  {/* Order ID */}
                  <td
                    className="p-4 font-medium text-indigo-600 underline cursor-pointer"
                    onClick={() => handleViewOrder(o._id)}
                  >
                    #{o.orderId}
                  </td>

                  {/* Customer Details */}
                  <td className="p-4 flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold text-xs">
                        {o.userId?.fname?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{getFullName(o.userId)}</p>
                      <p className="text-xs text-muted-foreground">
                        {o.userId?.email}
                      </p>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="p-4">
                    {new Date(o.createdAt).toLocaleDateString()}
                    <br />
                    <span className="text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleTimeString()}
                    </span>
                  </td>

                  {/* Total Items */}
                  <td className="p-4 font-medium text-gray-600">
                    {getTotalItems(o.products)}
                  </td>

                  {/* Total Price */}
                  <td className="p-4 font-bold text-green-700 flex items-center">
                    <IndianRupee size={12} className="mr-1" />
                    {o.totalAmt.toFixed(2)}
                  </td>

                  {/* Status Badge */}
                  <td className="p-4">
                    <OrderStatusBadge status={o.order_status} />
                  </td>

                  {/* Actions Dropdown */}
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewOrder(o._id)}
                          className="cursor-pointer"
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 cursor-pointer">
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 2. Mobile Card/List View (Visible below sm breakpoint) */}
      <div className="sm:hidden space-y-3 p-2">
        {loading ? (
          <OrderMobileSkeleton />
        ) : orders.length === 0 ? (
          <p className="text-center py-6 font-semibold text-gray-600">
            No orders found matching the filters.
          </p>
        ) : (
          orders.map((o: OrderData) => (
            <div
              key={o._id}
              className="border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow"
            >
              {/* Header: Order ID & Status */}
              <div className="flex justify-between items-start mb-3 border-b pb-2">
                <p
                  className="font-bold text-lg text-indigo-600 underline cursor-pointer"
                  onClick={() => handleViewOrder(o._id)}
                >
                  #{o.orderId}
                </p>
                <OrderStatusBadge status={o.order_status} />
              </div>

              {/* Customer & Items */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold text-xs">
                      {o.userId?.fname?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{getFullName(o.userId)}</span>
                  <span className="text-xs text-muted-foreground">
                    ({o.userId?.email})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-600">
                    {getTotalItems(o.products)} Items
                  </span>
                </div>
              </div>

              {/* Price & Date */}
              <div className="flex justify-between items-center mt-3 pt-3 border-t">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Order Date
                  </span>
                  <p className="font-medium text-gray-700">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground">
                    Total Price
                  </span>
                  <p className="font-bold text-lg text-green-700 flex items-center">
                    <IndianRupee size={14} className="mr-1" />
                    {o.totalAmt.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 flex justify-end">
                <Button
                  onClick={() => handleViewOrder(o._id)}
                  variant="outline"
                  size="sm"
                  className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                >
                  View Details
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls (Applies to both views) */}
      <div className="p-4 flex justify-between items-center border-t bg-muted/40">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <div className="space-x-2 flex items-center">
          <Button
            onClick={onPrevPage}
            disabled={currentPage === 1 || loading}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            onClick={onNextPage}
            disabled={currentPage === totalPages || loading}
            variant="outline"
            size="sm"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
