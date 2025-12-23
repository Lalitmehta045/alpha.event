import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { ensureAdmin } from "@/lib/adminGuard";
import { connectDB } from "@/lib/db";
import ProductModel from "@/lib/models/Product.model";

interface ParamsPromise {
  params: Promise<{ id: string }>;
}

// ✅ GET product by ID
export async function GET(req: NextRequest, { params }: ParamsPromise) {
  try {
    await ensureAdmin(req); // ✅ Pass the request to verify token

    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await ProductModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        // Join categories
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        // Join subcategories
        $lookup: {
          from: "subcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategoryDetails",
        },
      },
      {
        $project: {
          name: 1,
          image: 1,
          unit: 1,
          stock: 1,
          price: 1,
          discount: 1,
          description: 1,
          more_details: 1,
          publish: 1,
          createdAt: 1,
          updatedAt: 1,

          // Project the full array of category objects
          category: {
            $map: {
              input: "$categoryDetails",
              as: "cat",
              in: {
                _id: "$$cat._id",
                name: "$$cat.name",
                image: "$$cat.image",
              },
            },
          },

          // Project the full array of subCategory objects
          subCategory: {
            $map: {
              input: "$subCategoryDetails",
              as: "sub",
              in: {
                _id: "$$sub._id",
                name: "$$sub.name",
                image: "$$sub.image",
              },
            },
          },
        },
      },
    ]);

    if (!product || product.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product fetched successfully",
        data: product[0], // returns the product with arrays of populated objects
      },
      { status: 200 }
    );
  } catch (err) {
    console.log("Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// ✅ UPDATE product
export async function PUT(req: NextRequest, { params }: ParamsPromise) {
  try {
    await ensureAdmin(req); // ✅ Pass the request to verify token

    await connectDB();

    const body = await req.json();
    const { id } = await params; // ✅ FIX

    const product = await ProductModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!product)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json(
      {
        success: true,
        message: "Product update successfully",
        data: product,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Unauthorized or invalid data" },
      { status: 401 }
    );
  }
}

// ✅ DELETE product
export async function DELETE(req: NextRequest, { params }: ParamsPromise) {
  try {
    await ensureAdmin(req); // ✅ Pass the request to verify token

    await connectDB();

    const { id } = await params; // ✅ FIX

    const product = await ProductModel.findByIdAndDelete(id);

    if (!product)
      return NextResponse.json({ error: "Product not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
