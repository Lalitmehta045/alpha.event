import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyUser } from "@/lib/verifyUser";
import CartModel from "@/lib/models/Cart.model";
import "@/lib/models/Product.model"; // 🔥 REQUIRED IMPORT
import UserModel from "@/lib/models/User.model";
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
 * Generate signed URLs for product images in cart items.
 * Converts S3 keys (e.g., "recent/123-abc.jpg") to temporary signed URLs.
 * Full URLs (old products starting with "http") are returned as-is.
 */
async function generateSignedUrlsForCartItems(cartItems: any[]) {
  for (const item of cartItems) {
    const product = item.productId || item.product;
    if (!product || !product.image || !Array.isArray(product.image)) continue;

    const signedUrls = await Promise.all(
      product.image.map(async (key: string) => {
        // If already a full URL (old products), return as-is
        if (key.startsWith("http")) return key;

        try {
          const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: key,
          });
          return await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
        } catch (error) {
          console.error(`[Cart] Failed to sign URL for key: ${key}`, error);
          return key; // Return original key if signing fails
        }
      })
    );
    product.image = signedUrls;
  }
  return cartItems;
}

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

    // 🔥 Generate signed URLs for product images (fixes new product images in cart)
    const cartWithSignedUrls = await generateSignedUrlsForCartItems(cart);

    return NextResponse.json({
      success: true,
      message: "Cart fetched successfully",
      data: cartWithSignedUrls,
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
      const populated = await CartModel.findById(existingItem._id)
        .populate("productId")
        .lean();

      // 🔥 Generate signed URLs for product images
      if (populated) {
        await generateSignedUrlsForCartItems([populated]);
      }

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
    const populatedNew = await CartModel.findById(newItem._id)
      .populate("productId")
      .lean();

    // 🔥 Generate signed URLs for product images
    if (populatedNew) {
      await generateSignedUrlsForCartItems([populatedNew]);
    }

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
