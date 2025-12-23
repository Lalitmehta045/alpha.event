import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ProductModel from "@/lib/models/Product.model";
import mongoose from "mongoose";

interface ParamsPromise {
  params: Promise<{ productId: string }>;
}

export async function GET(req: NextRequest, context: ParamsPromise) {
  try {
    await connectDB();
    const { productId } = await context.params;

    // 1. First get the product details
    const product = await ProductModel.findById(productId);

    if (!product) {
      return new Response(
        JSON.stringify({ success: false, message: "Product not found" }),
        { status: 404 }
      );
    }

    // Extract multiple subCategories
    const subCategories = product.subCategory; // ["id1", "id2"]

    // 2. Find similar products (based on any subCategory match)
    const similarProducts = await ProductModel.find({
      _id: { $ne: productId }, // exclude current product
      publish: true,
      subCategory: { $in: subCategories }, // match ANY subCategory
    }).limit(10);

    return NextResponse.json(
      {
        success: true,
        message: "Similar products fetched successfully",
        count: similarProducts.length,
        data: similarProducts,
      },
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Server error while get product sub category",
      }),
      { status: 500 }
    );
  }
}
