import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User.model";
import { verifyUser } from "@/lib/verifyUser";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const verified = verifyUser(req);

    if (!session?.user?.email && !verified?.userId && !verified?.email) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { phone } = await req.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    const phoneRegex = /^\+\d{1,4}\s\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    await connectDB();

    // Try to find user either by session email or verified token id/email
    let user = null;

    if (session?.user?.email) {
      user = await UserModel.findOne({ email: session.user.email });
    }

    if (!user && verified?.userId) {
      user = await UserModel.findById(verified.userId);
    }

    if (!user && verified?.email) {
      user = await UserModel.findOne({ email: verified.email });
    }
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    user.phone = phone;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Phone number saved successfully",
      data: {
        phone: user.phone,
      },
    });
  } catch (error: any) {
    console.error("Save phone error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save phone number" },
      { status: 500 }
    );
  }
}
