import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ensureAdmin } from "@/lib/adminGuard";
import SubCategoryModel from "@/lib/models/SubCategory.model";

export async function GET(req: NextRequest) {
  try {
    await ensureAdmin(req);
    await connectDB();

    const subCategories = await SubCategoryModel.aggregate([
      {
        $lookup: {
          from: "categories", // collection name
          localField: "category", // field in subCategory
          foreignField: "_id", // field in Category
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true, // ✅ keeps items even if category missing
        },
      },
      {
        $sort: {
          "category.name": 1,
        },
      },
      // {
      //   $project: {
      //     _id: 1,
      //     name: 1,
      //     image: 1,
      //     createdAt: 1,
      //     updatedAt: 1,
      //     category: {
      //       _id: "$category._id",
      //       name: "$category.name",
      //       image: "$category.image",
      //     },
      //   },
      // },
    ]);

    return NextResponse.json({
      success: true,
      message: "All SubCategories fetched successfully",
      data: subCategories,
    });
  } catch (error: any) {
    console.error("GET SUBCATEGORY ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unauthorized" },
      { status: 401 }
    );
  }
}

// ✅ POST handler
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // ✅ Verify admin
    await ensureAdmin(req);

    // ✅ Parse request body properly
    const { name, image, category } = await req.json();

    // ✅ Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, message: "SubCategory name is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(category) || category.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one category is required" },
        { status: 400 }
      );
    }

    // ✅ Save SubCategory to DB
    const subCategory = await SubCategoryModel.create({
      name,
      image,
      category, // store category IDs as array
    });

    return NextResponse.json({
      success: true,
      message: "SubCategory added successfully",
      data: subCategory,
    });
  } catch (error: any) {
    console.error("ADD SUBCATEGORY API ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Could not add SubCategory",
      },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
