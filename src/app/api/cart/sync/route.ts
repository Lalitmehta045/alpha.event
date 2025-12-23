// /api/cart/sync/route.ts (Next.js API Route)

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyUser } from "@/lib/verifyUser";
import CartModel from "@/lib/models/Cart.model";

// Define a type for the incoming local cart item (must match the client's local object structure)
interface LocalCartItem {
  _id: string; // This is the PRODUCT ID when added locally
  quantity: number;
  // Note: The product object will also be nested here, but we only need _id and quantity for the DB query.
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // 1. 🔒 Authentication
    const auth = verifyUser(req);
    if (!auth) {
      return NextResponse.json({ success: false, message: "Unauthorized" });
    }
    const userId = auth.userId;

    // 2. getBody Data
    const localCartItems: LocalCartItem[] = await req.json();

    if (!Array.isArray(localCartItems) || localCartItems.length === 0) {
      // If the local cart is empty, just return the current DB cart.
      const existingCart = await CartModel.find({ userId })
        .populate("productId")
        .lean();
      return NextResponse.json({
        success: true,
        message: "Local cart was empty, returning DB cart.",
        data: existingCart,
      });
    }

    // 3. 🔄 Process and Merge Local Items
    const operations = localCartItems.map((item) => {
      const { _id: productId, quantity } = item;

      // NOTE: We use the product ID from the local cart for the DB query.
      return {
        updateOne: {
          filter: { userId, productId },
          update: {
            // If item exists, increase quantity; if not, set initial quantity
            $inc: { quantity: quantity },
            // Set the userId and productId on insert (if upsert creates a new document)
            $set: { userId, productId },
          },
          upsert: true, // Crucial: Insert if no matching cart item found
        },
      };
    });

    // Use bulkWrite for efficient, atomic operations
    await CartModel.bulkWrite(operations);

    // 4. 🚀 Fetch and Return Final Merged Cart
    const mergedCart = await CartModel.find({ userId })
      .populate("productId")
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Cart successfully synchronized and merged.",
        data: mergedCart,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Cart Sync Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error during sync" },
      { status: 500 }
    );
  }
}
