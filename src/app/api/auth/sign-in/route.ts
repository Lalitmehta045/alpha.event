import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import UserModel from "@/lib/models/User.model";
import { connectDB } from "@/lib/db";
import { generateAccessToken } from "@/lib/token/generateAccessToken";
import { generateRefreshToken } from "@/lib/token/generateRefreshToken";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    let email, password;
    try {
      const body = await req.json();
      email = body.email;
      password = body.password;
    } catch (jsonError) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body", message: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email & Password required", message: "Email & Password required" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User does not exist", message: "User does not exist" },
        { status: 404 }
      );
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials", message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check user status
    if (user.status !== "Active") {
      return NextResponse.json(
        { success: false, error: "Account is suspended or inactive", message: "Account is suspended or inactive" },
        { status: 403 }
      );
    }

    const userId = user._id.toString();

    // ✅ Generate secure tokens
    const accessToken = await generateAccessToken(
      userId,
      user.email,
      user.role
    );
    const refreshToken = await generateRefreshToken(
      userId,
      user.email,
      user.role
    );

    // ✅ Update last login date
    await UserModel.updateOne({ _id: user._id }, { last_login_date: new Date() });

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
      vendorStatus: user.vendorStatus,
    };

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        user: payload,
      },
    });

    // ✅ Set httpOnly cookies with proper expiry
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60, // 15 minutes — matches JWT expiry
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days — matches JWT expiry
    });

    return response;
  } catch (error: any) {
    console.error("Sign-in error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during login. Please try again.", message: "An unexpected error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
