import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User.model";
import { ensureAdmin } from "@/lib/adminGuard";

export async function GET(req: NextRequest) {
  try {
    await ensureAdmin(req);
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status") || "Pending_Review"; // Pending_Review, Approved, Rejected
    const search = searchParams.get("search")?.trim() || "";

    let filter: any = { 
      role: "VENDOR",
      vendorStatus: status
    };

    if (search) {
      filter.$or = [
        { fname: { $regex: search, $options: "i" } },
        { lname: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const vendors = await UserModel.find(filter)
      .populate("vendorCategories", "name")
      .select("fname lname email phone role vendorStatus vendorCategories vendorAddress idProof createdAt")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      message: "Fetched vendor accounts successfully",
      data: vendors,
    });
  } catch (error: any) {
    console.error("GET VENDOR ACCOUNTS ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
