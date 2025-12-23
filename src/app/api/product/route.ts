import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ProductModel from "@/lib/models/Product.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get search query from URL
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    let filter = {};

    // If query exists, filter products by name or description (case-insensitive)
    if (query) {
      filter = {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      };
    }

    const products = await ProductModel.find(filter)
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      message: query
        ? `Products matching "${query}"`
        : "Successfully GET ALL Products Data",
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
