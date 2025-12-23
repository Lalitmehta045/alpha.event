import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ensureAdmin } from "@/lib/adminGuard";
import SubCategoryModel from "@/lib/models/SubCategory.model";

interface ParamsPromise {
  params: Promise<{ id: string }>;
}

// ✅ GET category by ID
export async function GET(req: NextRequest, { params }: ParamsPromise) {
  try {
    await ensureAdmin(req); // ✅ Pass the request to verify token

    await connectDB();

    const { id } = await params; // ✅ FIX
    const subCategories = await SubCategoryModel.findById(id).lean();

    if (!subCategories)
      return NextResponse.json(
        { error: "SubCategory not found" },
        { status: 404 }
      );

    return NextResponse.json(subCategories);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// ✅ UPDATE category
export async function PUT(req: NextRequest, { params }: ParamsPromise) {
  try {
    await connectDB();
    await ensureAdmin(req); // ✅ Verify admin before update

    const { id } = await params; // ✅ Extract subcategory ID from URL params
    const data = await req.json(); // ✅ Parse request body

    // ✅ Optional: Validate data structure
    if (!data.name && !data.image && !data.category) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided for update" },
        { status: 400 }
      );
    }

    // ✅ Run the update
    const updatedSubCategory = await SubCategoryModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedSubCategory) {
      return NextResponse.json(
        { success: false, message: "SubCategory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "SubCategory updated successfully",
      data: updatedSubCategory,
    });
  } catch (error: any) {
    console.error("UPDATE SUBCATEGORY API ERROR:", error);

    const status = error.message?.includes("Unauthorized") ? 401 : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error updating SubCategory",
      },
      { status }
    );
  }
}

// ✅ DELETE category
export async function DELETE(req: NextRequest, { params }: ParamsPromise) {
  try {
    await ensureAdmin(req); // ✅ Pass the request to verify token

    await connectDB();

    const { id } = await params; // ✅ FIX

    const deletedSubCategory = await SubCategoryModel.findByIdAndDelete(id);

    if (!deletedSubCategory)
      return NextResponse.json(
        { error: "SubCategory not found" },
        { status: 404 }
      );

    return NextResponse.json({
      success: true,
      message: "SubCategory deleted successfully",
      data: deletedSubCategory,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
