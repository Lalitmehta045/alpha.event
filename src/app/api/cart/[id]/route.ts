import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CartModel from "@/lib/models/Cart.model";
import { verifyUser } from "@/lib/verifyUser";

interface ParamsPromise {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: ParamsPromise) {
  try {
    await connectDB();

    const auth = verifyUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    const { id } = await params; // ✅ FIX

    const cartItem = await CartModel.findById(id).populate("productId");

    if (!cartItem) {
      return NextResponse.json(
        { success: false, message: "Cart item not found" },
        { status: 404 }
      );
    }

    // User ownership check
    if (cartItem.userId.toString() !== auth.userId) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "All Cart item fetched",
      data: cartItem,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: ParamsPromise) {
  try {
    await connectDB();

    const auth = verifyUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    const { id } = await params;

    const { quantity } = await req.json();

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { success: false, message: "Valid quantity is required" },
        { status: 400 }
      );
    }

    // Update quantity
    let updatedItem = await CartModel.findOneAndUpdate(
      { _id: id, userId: auth.userId },
      { quantity },
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json(
        { success: false, message: "Cart item not found" },
        { status: 404 }
      );
    }

    // 🔥 POPULATE PRODUCT DETAILS
    updatedItem = await CartModel.findById(updatedItem._id).populate(
      "productId"
    );

    return NextResponse.json({
      success: true,
      message: "Cart updated successfully",
      data: updatedItem,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: ParamsPromise) {
  try {
    await connectDB();

    const auth = verifyUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    const { id } = await params; // ✅ FIX

    const deleted = await CartModel.findOneAndDelete({
      _id: id,
      userId: auth.userId,
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Cart item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
