import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User.model";
import { ensureAdmin } from "@/lib/adminGuard";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ✅ GET Admin by ID
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    await ensureAdmin(req); // ✅ Pass the request to verify token

    await connectDB();

    const { id } = await context.params;

    const admin = await UserModel.findOne({ _id: id, role: "ADMIN" })
      .select("_id name email phone avatar status role")
      .lean();

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json(admin);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// ✅ UPDATE Admin
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    await ensureAdmin(req);

    await connectDB();

    const { id } = await context.params;

    const data = await req.json();

    const updatedAdmin = await UserModel.findOneAndUpdate(
      { _id: id, role: "ADMIN" },
      data,
      { new: true, runValidators: true }
    ).select("_id status role");

    if (!updatedAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // 6️⃣ Send updated user response
    return NextResponse.json(updatedAdmin);
  } catch (error: any) {
    console.error("UPDATE ADMIN ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Unauthorized or invalid data" },
      { status: 401 }
    );
  }
}

// ✅ DELETE Admin
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    await ensureAdmin(req); // ✅ Pass the request to verify token

    await connectDB();
    const { id } = await context.params;

    const deletedAdmin = await UserModel.findOneAndDelete({
      _id: id,
      role: "ADMIN",
    });

    if (!deletedAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Admin deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
