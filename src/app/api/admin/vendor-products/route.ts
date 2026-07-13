import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/adminGuard";
import { connectDB } from "@/lib/db";
import ProductModel from "@/lib/models/Product.model";
import { attachSignedUrlsAndThumbnails } from "@/utils/s3Signer";

// GET vendor products for Admin
export async function GET(req: NextRequest) {
  try {
    await ensureAdmin(req); // verify admin token
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Build query: only products that have a vendorId
    const query: any = { vendorId: { $ne: null } };
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status;
    }

    const products = await ProductModel.find(query)
      .populate("category")
      .populate("subCategory")
      .populate("vendorId", "fname lname email businessName")
      .sort({ createdAt: -1 })
      .lean();

    // Generate fresh signed URLs for all product images
    const productsWithSignedUrls = await attachSignedUrlsAndThumbnails(products);

    // Calculate counts for all vendor products (unfiltered)
    const allVendorProducts = await ProductModel.find({ vendorId: { $ne: null } }).lean();
    
    const counts = {
      total: allVendorProducts.length,
      pending: allVendorProducts.filter((p: any) => p.status === "pending").length,
      approved: allVendorProducts.filter((p: any) => p.status === "approved").length,
      rejected: allVendorProducts.filter((p: any) => p.status === "rejected").length,
    };

    return NextResponse.json({
      success: true,
      message: "Successfully fetched vendor products",
      data: productsWithSignedUrls,
      counts,
    });
  } catch (error: any) {
    console.error("GET VENDOR PRODUCTS ADMIN ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unauthorized",
      },
      { status: 401 }
    );
  }
}
