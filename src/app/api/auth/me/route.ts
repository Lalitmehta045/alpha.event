import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User.model";
import { generateAccessToken } from "@/lib/token/generateAccessToken";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("accessToken")?.value;
    const refreshToken = req.cookies.get("refreshToken")?.value;

    let decoded: any = null;
    let usedToken = null;
    let newAccessToken = null;

    // 1. Try accessToken first
    if (accessToken) {
      try {
        const accessSecret = process.env.SECRET_KEY_ACCESS_TOKEN;
        if (!accessSecret) throw new Error("Missing access secret");
        decoded = jwt.verify(accessToken, accessSecret);
        usedToken = accessToken;
      } catch (err) {
        // Expired or invalid accessToken
        decoded = null;
      }
    }

    // 2. If no valid accessToken, try refreshToken
    if (!decoded && refreshToken) {
      try {
        const refreshSecret = process.env.SECRET_KEY_REFRESH_TOKEN;
        if (!refreshSecret) throw new Error("Missing refresh secret");
        decoded = jwt.verify(refreshToken, refreshSecret);
        newAccessToken = await generateAccessToken(
          decoded.id,
          decoded.email,
          decoded.role
        );
        usedToken = newAccessToken;
      } catch (err) {
        // Expired or invalid refreshToken
        decoded = null;
      }
    }

    if (!decoded || !decoded.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 3. Verify user in database
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

    const response = NextResponse.json({
      success: true,
      data: {
        user: payload,
        token: usedToken,
      },
    });

    if (newAccessToken) {
      response.cookies.set("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
