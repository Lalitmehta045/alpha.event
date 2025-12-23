import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import SubCategoryModel from "@/lib/models/SubCategory.model";
import mongoose from "mongoose";

interface ParamsPromise {
  params: Promise<{ id: string }>;
}

// ✅ GET category by ID
export async function GET(req: NextRequest, { params }: ParamsPromise) {
  try {
    await connectDB();

    const { id } = await params;

    const subCategory = await SubCategoryModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "categories", // MongoDB collection name (lowercase, plural)
          localField: "category", // field in SubCategory
          foreignField: "_id", // reference in Category
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
      {
        $project: {
          name: 1,
          image: 1,
          createdAt: 1,
          updatedAt: 1,
          "category._id": "$categoryDetails._id",
          "category.name": "$categoryDetails.name",
          "category.image": "$categoryDetails.image",
        },
      },
    ]);

    if (!subCategory.length) {
      return NextResponse.json(
        { error: "SubCategory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "SubCategory fetched successfully",
        data: subCategory[0],
      },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
