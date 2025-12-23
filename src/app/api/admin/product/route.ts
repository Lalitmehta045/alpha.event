import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/adminGuard";
import { connectDB } from "@/lib/db";
import ProductModel from "@/lib/models/Product.model";
import { Category, SubCategory } from "@/@types/catregory";

interface ProductPayload {
  name: string;
  image: string[];
  category: Category[]; // full objects in form
  subCategory: SubCategory[];
  unit: string;
  stock?: number;
  price: number;
  discount?: number;
  description: string;
  more_details?: Record<string, string>;
}

// GET all products
// GET all products for Admin
export async function GET(req: NextRequest) {
  try {
    await ensureAdmin(req); // verify admin token

    await connectDB();

    const products = await ProductModel.find()
      .populate("category")
      .populate("subCategory")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      message: "Successfully fetched all products",
      data: products,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Unauthorized",
      },
      { status: 401 }
    );
  }
}

// POST new product
export async function POST(req: NextRequest) {
  try {
    // ✅ Ensure Admin Authentication
    await ensureAdmin(req);

    // ✅ Connect to DB
    await connectDB();

    // ✅ Parse the request body
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

    // ✅ Validate required fields
    if (
      !name ||
      !image?.[0] ||
      !category?.[0] ||
      !subCategory?.[0] ||
      !unit ||
      !price ||
      !description
    ) {
      return NextResponse.json(
        {
          success: false,
          error: true,
          message: "Enter required fields",
        },
        { status: 400 }
      );
    }

    // ✅ Create new product
    const newProduct = await ProductModel.create({
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
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: newProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("CREATE PRODUCT ERROR:", error);

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
