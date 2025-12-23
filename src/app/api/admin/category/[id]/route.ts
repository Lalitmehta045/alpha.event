import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CategoryModel from "@/lib/models/Category.model";
import { ensureAdmin } from "@/lib/adminGuard";

interface ParamsPromise {
  params: Promise<{ id: string }>;
}

// ✅ GET category by ID
export async function GET(req: NextRequest, { params }: ParamsPromise) {
  try {
    await ensureAdmin(req); // ✅ Pass the request to verify token
    await connectDB();

    const { id } = await params; // ✅ FIX
    const category = await CategoryModel.findById(id).lean();

    if (!category)
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );

    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// ✅ UPDATE category
export async function PUT(req: NextRequest, { params }: ParamsPromise) {
  try {
    await ensureAdmin(req);
    await connectDB();

    const { id } = await params;
    const data = await req.json();

    const updatedCategory = await CategoryModel.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedCategory)
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (err: any) {
    console.error("UPDATE CATEGORY ERROR:", err);
    return NextResponse.json(
      { success: false, message: "Unauthorized or invalid data" },
      { status: 401 }
    );
  }
}

// ✅ DELETE category
export async function DELETE(req: NextRequest, { params }: ParamsPromise) {
  try {
    await ensureAdmin(req); // ✅ Pass the request to verify token
    await connectDB();

    const { id } = await params; // ✅ FIX

    const deletedCategory = await CategoryModel.findByIdAndDelete(id);

    if (!deletedCategory)
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
      data: deletedCategory,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
