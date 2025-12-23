import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CategoryModel from "@/lib/models/Category.model";
import { ensureAdmin } from "@/lib/adminGuard";

export async function GET(req: NextRequest) {
  try {
    await ensureAdmin(req); // ✅ Pass the request to verify token
    await connectDB();

    const categories = await CategoryModel.find()
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({
      success: true,
      message: "All Categories fetch successfully",
      data: categories,
    });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// ✅ POST handler
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // ✅ Verify admin
    await ensureAdmin(req);

    // ✅ Parse request body properly
    const { name, image, description } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Category name is required" },
        { status: 400 }
      );
    }

    // ✅ Save category to DB
    const category = await CategoryModel.create({ name, image, description });

    return NextResponse.json({
      success: true,
      message: "Category added successfully",
      data: category,
    });
  } catch (error: any) {
    console.error("ADD CATEGORY API ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Could not add category" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}
