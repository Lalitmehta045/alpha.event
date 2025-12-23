import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/adminGuard";
import { connectDB } from "@/lib/db";
import OrderModel from "@/lib/models/Order.model";
import mongoose from "mongoose";

interface ParamsPromise {
  params: Promise<{ id: string }>;
}

// ✅ GET order by ID
// GET /api/admin/orders/[id]
export async function GET(req: NextRequest, { params }: ParamsPromise) {
  const { id } = await params;

  // ⭐ Basic check for valid MongoDB ID format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, error: "Invalid Order ID format" },
      { status: 400 }
    );
  }

  try {
    await ensureAdmin(req); // Admin-only access
    await connectDB();

    const order = await OrderModel.findById(id)
      .populate("userId", "fname lname email phone avatar role")
      .populate("delivery_address")
      .populate("products.productId") // important for admin
      .lean();

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error: any) {
    console.error("Admin Get Order Error:", error);

    // ⭐ Optional: If ensureAdmin throws a non-500 error, handle it (e.g., 403 Forbidden)
    if (
      error.message &&
      (error.message.includes("Unauthorized") ||
        error.message.includes("Forbidden"))
    ) {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

// ✅ UPDATE order
export async function PUT(req: NextRequest, { params }: ParamsPromise) {
  try {
    await connectDB();

    await ensureAdmin(req);

    const { id } = await params;
    const { order_status } = await req.json();

    const allowed = ["Processing", "Request", "Accepted", "Cancelled"];

    if (!allowed.includes(order_status)) {
      return NextResponse.json(
        { success: false, message: "Invalid order status" },
        { status: 400 }
      );
    }

    const updatedOrder = await OrderModel.findByIdAndUpdate(
      id,
      { order_status },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}

// ✅ DELETE order
export async function DELETE(req: NextRequest, { params }: ParamsPromise) {
  try {
    await ensureAdmin(req); // ✅ Pass the request to verify token

    await connectDB();

    const { id } = await params; // ✅ FIX

    const order = await OrderModel.findByIdAndDelete(id);

    if (!order)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
