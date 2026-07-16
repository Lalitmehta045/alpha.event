import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ensureVendor, getCurrentVendor } from "@/lib/vendorGuard";
import OrderModel from "@/lib/models/Order.model";
import ProductModel from "@/lib/models/Product.model";
import { attachSignedUrlsAndThumbnails } from "@/utils/s3Signer";
// Import dependencies to ensure schema registration for populate
import "@/lib/models/User.model";
import "@/lib/models/Address.model";

export async function GET(req: NextRequest) {
  try {
    await ensureVendor(req);
    const vendorId = await getCurrentVendor(req);
    
    await connectDB();

    const vendorProducts = await ProductModel.find({ vendorId }).select("_id").lean();
    const vendorProductIds = vendorProducts.map((p: any) => p._id);

    const orders = await OrderModel.find({
      "products.productId": { $in: vendorProductIds },
    })
      .populate("userId", "fname lname email phone")
      .populate({
        path: "products.productId",
        select: "name image price vendorId",
      })
      .populate("delivery_address")
      .sort({ createdAt: -1 })
      .lean();

    // Filter each order's products array to only include this vendor's products
    const filteredOrders = orders
      .map((order: any) => {
        // Handle TS mapping when product.productId is populated
        const filteredProducts = order.products.filter((p: any) => {
          return p.productId?.vendorId?.toString() === vendorId.toString();
        });
        return {
          ...order,
          products: filteredProducts,
        };
      })
      .filter((order: any) => order.products.length > 0);

    // Attach signed URLs to the products inside each order
    const allOrderProducts = filteredOrders.flatMap((o: any) => o.products);
    await attachSignedUrlsAndThumbnails(allOrderProducts);

    return NextResponse.json({
      success: true,
      data: filteredOrders,
      total: filteredOrders.length,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message.includes("Only Vendor")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("Vendor Orders Fetch Error:", error);
    return NextResponse.json({ error: "Server error fetching vendor orders" }, { status: 500 });
  }
}
