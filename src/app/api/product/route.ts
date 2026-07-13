import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ProductModel from "@/lib/models/Product.model";
import { attachSignedUrlsAndThumbnails } from "@/utils/s3Signer";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get search query from URL
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    // Base filter to only show published AND (approved OR existing products without status)
    let filter: any = {
      publish: true,
      $or: [{ status: "approved" }, { status: { $exists: false } }],
    };

    // If query exists, add name/description search to filter
    if (query) {
      filter = {
        $and: [
          filter,
          {
            $or: [
              { name: { $regex: query, $options: "i" } },
              { description: { $regex: query, $options: "i" } },
            ],
          },
        ],
      };
    }

    const products = await ProductModel.find(filter)
      .sort({ createdAt: -1 }) // ✅ -1 = descending (newest first)
      .lean();

    // ✅ Generate fresh signed URLs and thumbnails for all product images
    const productsWithSignedUrls = await attachSignedUrlsAndThumbnails(products);

    return NextResponse.json({
      success: true,
      message: query
        ? `Products matching "${query}"`
        : "Successfully GET ALL Products Data",
      count: productsWithSignedUrls.length,
      data: productsWithSignedUrls,
    });
  } catch (err: any) {
    console.error("GET PRODUCT ERROR:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
