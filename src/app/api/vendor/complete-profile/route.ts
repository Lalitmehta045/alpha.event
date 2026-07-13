import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User.model";
import { ensureVendor } from "@/lib/vendorGuard";

export async function POST(req: NextRequest) {
  try {
    const decoded = await ensureVendor(req);
    await connectDB();

    const body = await req.json();
    const { vendorCategories, vendorAddress, idProof } = body;

    if (!vendorCategories || vendorCategories.length === 0) {
      return NextResponse.json(
        { success: false, message: "Categories are required" },
        { status: 400 }
      );
    }

    if (!vendorAddress) {
      return NextResponse.json(
        { success: false, message: "Business address is required" },
        { status: 400 }
      );
    }

    if (!idProof) {
      return NextResponse.json(
        { success: false, message: "ID proof is required" },
        { status: 400 }
      );
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: decoded.id },
      {
        vendorCategories,
        vendorAddress,
        idProof,
        vendorStatus: "Pending_Review",
      },
      { new: true }
    ).select("-password -refresh_token");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile submitted for review successfully.",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("COMPLETE VENDOR PROFILE ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to submit profile" },
      { status: 500 }
    );
  }
}
