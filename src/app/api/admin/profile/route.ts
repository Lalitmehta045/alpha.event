import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User.model";
import { getCurrentAdmin } from "@/lib/adminGuard";
// ✅ Must return logged-in admin ID

// ✅ GET Logged-in Admin Profile
export async function GET(req: NextRequest) {
  try {
    const adminId = await getCurrentAdmin(req); // Extract admin ID from token/session
    await connectDB();

    const admin = await UserModel.findById(adminId)
      .select("_id name email phone avatar status role")
      .lean();

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(admin);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// ✅ UPDATE Logged-in Admin Profile
export async function PUT(req: NextRequest) {
  try {
    const adminId = await getCurrentAdmin(req);
    await connectDB();

    const body = await req.json();

    const updatedAdmin = await UserModel.findByIdAndUpdate(adminId, body, {
      new: true,
      runValidators: true,
    }).select("_id name email phone avatar status role");

    if (!updatedAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(updatedAdmin);
  } catch (error) {
    return NextResponse.json(
      { error: "Unauthorized or invalid data" },
      { status: 401 }
    );
  }
}

// ✅ DELETE Logged-in Admin Profile
export async function DELETE(req: NextRequest) {
  try {
    const adminId = await getCurrentAdmin(req);
    await connectDB();

    const deletedAdmin = await UserModel.findByIdAndDelete(adminId);

    if (!deletedAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Admin profile deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
