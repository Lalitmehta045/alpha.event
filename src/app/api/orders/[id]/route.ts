import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import OrderModel from "@/lib/models/Order.model";
import { verifyUser } from "@/lib/verifyUser";

interface ParamsPromise {
  params: Promise<{ id: string }>;
}

// ================== GET SINGLE ORDER ==================
export async function GET(req: NextRequest, { params }: ParamsPromise) {
  try {
    await connectDB();

    const auth = verifyUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    const { id } = await params; // ✅ FIX

    const order = await OrderModel.findOne({ _id: id })
      .populate("userId")
      .populate("delivery_address")
      .populate("products.productId")
      .lean() as {
        _id: string;
        userId: { _id: string };
        delivery_address: any;
        products: any[];
      } | null;

    if (!order)
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );

    // Prevent users from viewing others' orders
    if (order.userId._id.toString() !== auth.userId) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order fetched successfully",
        data: order,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}

// ================== DELETE ORDER ==================
export async function DELETE(req: NextRequest, { params }: ParamsPromise) {
  try {
    await connectDB();

    const auth = verifyUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    const { id } = await params; // ✅ FIX

    const order = await OrderModel.findOne({ _id: id });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Ensure user owns this order
    if (order.userId.toString() !== auth.userId) {
      return NextResponse.json(
        { success: false, message: "You cannot delete this order" },
        { status: 403 }
      );
    }

    await OrderModel.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Order deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
