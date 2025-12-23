import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ProductModel from "@/lib/models/Product.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // 2. Calculate the date exactly 7 days ago.
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 3. Query products created on or after the calculated date.
    // We sort by 'createdAt' descending (-1) to show the newest items first.
    const popularProducts = await ProductModel.find({
      publish: true, // Only fetch published products (best practice)
      createdAt: { $gte: sevenDaysAgo },
    })
      .sort({ createdAt: 1 }) // Sort newest first
      .lean();

    // 4. Return the response
    return NextResponse.json({
      success: true,
      message: "Successfully fetched Most Popular Products (Last 7 Days)",
      count: popularProducts.length,
      data: popularProducts,
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
