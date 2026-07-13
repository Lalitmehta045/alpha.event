import { NextRequest, NextResponse } from "next/server";
import { ensureVendor, getCurrentVendor } from "@/lib/vendorGuard";
import { connectDB } from "@/lib/db";
import ProductModel from "@/lib/models/Product.model";
import { attachSignedUrlsAndThumbnails } from "@/utils/s3Signer";
import mongoose from "mongoose";

// GET vendor products + counts
export async function GET(req: NextRequest) {
  try {
    await ensureVendor(req);
    const vendorId = await getCurrentVendor(req);

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Build query
    const query: any = { vendorId: new mongoose.Types.ObjectId(vendorId) };
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status;
    }

    // Fetch filtered products
    const products = await ProductModel.find(query)
      .populate("category")
      .populate("subCategory")
      .sort({ createdAt: -1 })
      .lean();

    // Generate signed URLs for images
    const productsWithSignedUrls = await attachSignedUrlsAndThumbnails(products);

    // Calculate counts from all vendor products (unfiltered)
    const all = await ProductModel.find({
      vendorId: new mongoose.Types.ObjectId(vendorId),
    }).lean();

    const counts = {
      total: all.length,
      pending: all.filter((p: any) => p.status === "pending").length,
      approved: all.filter((p: any) => p.status === "approved").length,
      rejected: all.filter((p: any) => p.status === "rejected").length,
    };

    return NextResponse.json({
      success: true,
      data: productsWithSignedUrls,
      counts,
    });
  } catch (error: any) {
    console.error("VENDOR GET PRODUCTS ERROR:", error);
    const status = error.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status }
    );
  }
}
