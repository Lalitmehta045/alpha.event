import { NextRequest, NextResponse } from "next/server";
import { ensureVendor, getCurrentVendor } from "@/lib/vendorGuard";
import { connectDB } from "@/lib/db";
import ProductModel from "@/lib/models/Product.model";
import mongoose from "mongoose";

interface ProductPayload {
  name: string;
  image: string[];
  category: string[];
  subCategory: string[];
  unit: string;
  stock?: number;
  price: number;
  discount?: number;
  description: string;
  more_details?: Record<string, string>;
}

// POST — Create vendor product (status: pending, publish: false)
export async function POST(req: NextRequest) {
  try {
    await ensureVendor(req);
    const vendorId = await getCurrentVendor(req);

    await connectDB();

    const body: ProductPayload = await req.json();
    const {
      name,
      image,
      category,
      subCategory,
      unit,
      stock,
      price,
      discount,
      description,
      more_details,
    } = body;

    // Validate required fields
    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!image?.[0]) missingFields.push("image");
    if (!category?.[0]) missingFields.push("category");
    if (!subCategory?.[0]) missingFields.push("subCategory");
    if (!unit) missingFields.push("unit");
    if (!price) missingFields.push("price");
    if (!description) missingFields.push("description");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: `Enter required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Create product with vendor-specific defaults
    const newProduct = await ProductModel.create({
      name,
      image,
      category,
      subCategory,
      unit,
      stock: stock || 0,
      price,
      discount: discount || 0,
      description,
      more_details: more_details || {},
      status: "pending",
      publish: false,
      vendorId: new mongoose.Types.ObjectId(vendorId),
      vendorNote: "",
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Product submitted for approval. Admin will review it shortly.",
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("VENDOR CREATE PRODUCT ERROR:", error);

    if (error.name === "ValidationError") {
      console.error("Validation errors:", error.errors);
    }

    return NextResponse.json(
      {
        success: false,
        error: true,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
