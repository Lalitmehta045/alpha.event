import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CartModel from "@/lib/models/Cart.model";
import { verifyUser } from "@/lib/verifyUser";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client for generating signed URLs
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Generate signed URLs for a single cart item's product images.
 */
async function generateSignedUrlsForCartItem(item: any) {
  const product = item.productId || item.product;
  if (!product || !product.image || !Array.isArray(product.image)) return item;

  const signedUrls = await Promise.all(
    product.image.map(async (key: string) => {
      if (key.startsWith("http")) return key;

      try {
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: key,
        });
        return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      } catch (error) {
        console.error(`[Cart] Failed to sign URL for key: ${key}`, error);
        return key;
      }
    })
  );
  product.image = signedUrls;
  return item;
}

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

    const cartItem = await CartModel.findById(id).populate("productId").lean();

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

    // 🔥 Generate signed URLs for product images
    await generateSignedUrlsForCartItem(cartItem);

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
    const populatedItem = await CartModel.findById(updatedItem._id)
      .populate("productId")
      .lean();

    // 🔥 Generate signed URLs for product images
    if (populatedItem) {
      await generateSignedUrlsForCartItem(populatedItem);
    }

    return NextResponse.json({
      success: true,
      message: "Cart updated successfully",
      data: populatedItem,
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

