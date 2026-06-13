import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateAccessToken } from "@/lib/token/generateAccessToken";
import { generateRefreshToken } from "@/lib/token/generateRefreshToken";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User.model";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated", message: "Not authenticated" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await UserModel.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found", message: "User not found" },
        { status: 404 }
      );
    }

    const userId = user._id.toString();
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

    const response = NextResponse.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: userId,
          fname: user.fname,
          lname: user.lname,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
        },
      },
    });

    // ✅ Set httpOnly cookies with proper expiry (aligned with email login)
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Google token generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate Google token. Please try again.", message: "Failed to generate Google token. Please try again." },
      { status: 500 }
    );
  }
}

