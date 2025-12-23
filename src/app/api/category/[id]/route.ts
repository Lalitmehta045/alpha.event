import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CategoryModel from "@/lib/models/Category.model";
interface ParamsPromise {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: ParamsPromise) {
  try {
    await connectDB();

    const { id } = await params; // ✅ FIX

    const category = await CategoryModel.findById(id);

    if (!category)
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );

    return NextResponse.json(
      {
        success: true,
        error: false,
        message: "Category fetch successfully",
        data: category,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
