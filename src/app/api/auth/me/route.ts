import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User.model";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("accessToken")?.value;

    let decoded: any = null;

    if (accessToken) {
      try {
        const accessSecret = process.env.SECRET_KEY_ACCESS_TOKEN;
        if (!accessSecret) throw new Error("Missing access secret");
        decoded = jwt.verify(accessToken, accessSecret);
      } catch (err) {
        // Expired or invalid accessToken
        decoded = null;
      }
    }

    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user in database
    await connectDB();
    const user = await UserModel.findById(decoded.id).select("-password -refresh_token");

    if (!user || user.status !== "Active") {
      return NextResponse.json(
        { success: false, message: "User not found or inactive" },
        { status: 401 }
      );
    }

    let isCompleted = user.profileCompleted;
    if (!isCompleted) {
      const isDummyOTPUser = user.fname === "User" && user.lname === "Mobile";
      isCompleted = !!user.phone && !!user.fname && !!user.lname && !isDummyOTPUser;
    }

    const payload = {
      id: user._id.toString(),
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
      profileCompleted: isCompleted,
      vendorStatus: user.vendorStatus ?? null,
    };

    return NextResponse.json({
      success: true,
      data: {
        user: payload,
        token: accessToken,
      },
    });

  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
