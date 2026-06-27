import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ProductModel from "@/lib/models/Product.model";
import { attachSignedUrlsAndThumbnails } from "@/utils/s3Signer";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // 3. Query the latest 10 products to display as most popular/recent
    // We sort by 'createdAt' descending (-1) to show the newest items first.
    const popularProducts = await ProductModel.find({
      publish: true, // Only fetch published products (best practice)
    })
      .sort({ createdAt: -1 }) // Sort newest first
      .limit(10) // Limit to 10 products
      .lean();

    // ✅ Generate fresh signed URLs and thumbnails for all product images
    const productsWithSignedUrls = await attachSignedUrlsAndThumbnails(popularProducts);

    // 4. Return the response
    return NextResponse.json({
      success: true,
      message: "Successfully fetched Most Popular Products (Last 7 Days)",
      count: productsWithSignedUrls.length,
      data: productsWithSignedUrls,
    });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error fetching popular products:", error);

    // Return a generic error response
    return NextResponse.json(
      { error: "Failed to fetch popular products" },
      { status: 500 }
    );
  }
}
