import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ProductModel from "@/lib/models/Product.model";
import mongoose from "mongoose";
import { attachSignedUrlsAndThumbnails } from "@/utils/s3Signer";

interface ParamsPromise {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: ParamsPromise) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const productDoc = await ProductModel.findById(id)
      .populate("category")
      .populate("subCategory")
      .populate({
        path: "vendorId",
        select: "fname lname phone businessName businessPhone",
      })
      .lean();

    const product = productDoc ? [productDoc] : [];

    if (!product || product.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // ✅ Generate fresh signed URLs and thumbnails for product images
    await attachSignedUrlsAndThumbnails(product);
    const productWithSignedUrls = product[0];

    return NextResponse.json(
      {
        success: true,
        message: "Product fetched successfully",
        data: productWithSignedUrls, // returns the product with fresh signed URLs
      },
      { status: 200 }
    );
  } catch (err) {
    console.log("Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
