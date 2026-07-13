import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User.model";
import { ensureAdmin } from "@/lib/adminGuard";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureAdmin(req);
    await connectDB();

    const { id } = await params;
    const { vendorStatus } = await req.json();

    if (!["Approved", "Rejected", "Pending_Review"].includes(vendorStatus)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: id, role: "VENDOR" },
      { vendorStatus },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "Vendor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Vendor profile ${vendorStatus.toLowerCase()} successfully`,
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("UPDATE VENDOR STATUS ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
