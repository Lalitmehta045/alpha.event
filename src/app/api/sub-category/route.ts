import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SubCategoryModel from "@/lib/models/SubCategory.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const subCategories = await SubCategoryModel.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          "category.name": 1,
        },
      },
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
