import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import CategoryModel from "@/lib/models/Category.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const categories = await CategoryModel.find().sort({ createdAt: 1 }).lean();
    return NextResponse.json({
      success: true,
      message: "All Categories fetch successfully",
      data: categories,
    });
  } catch (error) {
    console.error("GET CATEGORY ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
