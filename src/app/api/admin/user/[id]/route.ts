import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User.model";
import { ensureAdmin } from "@/lib/adminGuard";
interface ParamsPromise {
  params: Promise<{ id: string }>;
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ✅ GET user by ID
// GET /api/admin/users/:id → Get a single user
export async function GET(req: NextRequest, { params }: ParamsPromise) {
  try {
    await ensureAdmin(req); // ✅ Pass the request to verify token

    await connectDB();

    const { id } = await params; // ✅ FIX

    const user = await UserModel.findOne({ _id: id, role: "USER" })
      .select(
        "_id name email phone avatar status role address_details shopping_cart orderHistory"
      )
      .lean();

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// PUT /api/admin/users/:id → Update a user
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    await ensureAdmin(req);

    await connectDB();

    const { id } = await context.params;

    const data = await req.json();

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: id, role: "USER" },
      data,
      { new: true, runValidators: true }
    ).select("_id status role");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 6️⃣ Send updated user response
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("UPDATE USER ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Unauthorized or invalid data" },
      { status: 401 }
    );
  }
}

// DELETE /api/admin/users/:id → Delete a user
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    await ensureAdmin(req); // ✅ Pass the request to verify token

    await connectDB();

    const { id } = await context.params;

    const deletedUser = await UserModel.findOneAndDelete({
      _id: id,
      role: "USER",
    });
    if (!deletedUser)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
