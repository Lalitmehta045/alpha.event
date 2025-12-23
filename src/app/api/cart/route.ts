import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyUser } from "@/lib/verifyUser";
import CartModel from "@/lib/models/Cart.model";
import "@/lib/models/Product.model"; // 🔥 REQUIRED IMPORT
import UserModel from "@/lib/models/User.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const auth = verifyUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    const cart = await CartModel.find({ userId: auth.userId })
      .populate("productId")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Cart fetched successfully",
      data: cart,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const auth = verifyUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }

    const { productId, quantity } = await req.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "productId is required" },
        { status: 400 }
      );
    }

    const userId = auth.userId;

    // Check existing
    let existingItem = await CartModel.findOne({
      productId,
      userId,
    });

    if (existingItem) {
      const qty = Number(quantity) || 1;
      existingItem.quantity += qty;
      await existingItem.save();

      // 🔥 POPULATE PRODUCT DETAILS
      const populated = await CartModel.findById(existingItem._id).populate(
        "productId"
      );

      return NextResponse.json({
        success: true,
        message: "Cart quantity updated",
        data: populated,
      });
    }

    // Create new
    const newItem = await CartModel.create({
      productId,
      quantity: quantity ?? 1,
      userId,
    });

    // 🔥 POPULATE PRODUCT DETAILS BEFORE SENDING
    const populatedNew = await CartModel.findById(newItem._id).populate(
      "productId"
    );

    await UserModel.findByIdAndUpdate(userId, {
      $push: { shopping_cart: newItem._id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Cart Item Added",
        data: populatedNew,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Product already exists in cart" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
