import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User.model";
import { generateAccessToken } from "@/lib/token/generateAccessToken";
import { generateRefreshToken } from "@/lib/token/generateRefreshToken";

export async function POST(req: NextRequest) {
  try {
    // 1. Read refresh token from httpOnly cookie
    const oldRefreshToken = req.cookies.get("refreshToken")?.value;

    if (!oldRefreshToken) {
      return NextResponse.json(
        { success: false, error: "No refresh token provided", message: "No refresh token provided" },
        { status: 401 }
      );
    }

    // 2. Verify JWT signature
    const secret = process.env.SECRET_KEY_REFRESH_TOKEN;
    if (!secret) {
      throw new Error("SECRET_KEY_REFRESH_TOKEN not defined in env");
    }

    let decoded: any;
    try {
      decoded = jwt.verify(oldRefreshToken, secret);
    } catch (err: any) {
      // Token expired or tampered
      const response = NextResponse.json(
        { success: false, error: "Refresh token expired or invalid", message: "Refresh token expired or invalid" },
        { status: 401 }
      );
      // Clear stale cookies
      response.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
      response.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
      return response;
    }

    // 3. Find user and validate refresh token matches DB (prevents reuse of stolen tokens)
    await connectDB();
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found", message: "User not found" },
        { status: 404 }
      );
    }

    if (user.refresh_token !== oldRefreshToken) {
      // Token reuse detected — possible token theft. Invalidate all sessions.
      await UserModel.updateOne({ _id: user._id }, { refresh_token: "" });

      const response = NextResponse.json(
        { success: false, error: "Token reuse detected. Please login again.", message: "Token reuse detected. Please login again." },
        { status: 401 }
      );
      response.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
      response.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
      return response;
    }

    // 4. Check user status
    if (user.status !== "Active") {
      return NextResponse.json(
        { success: false, error: "Account is suspended or inactive", message: "Account is suspended or inactive" },
        { status: 403 }
      );
    }

    // 5. Generate new token pair (rotation)
    const userId = user._id.toString();
    const newAccessToken = await generateAccessToken(
      userId,
      user.email,
      user.role
    );
    const newRefreshToken = await generateRefreshToken(
      userId,
      user.email,
      user.role
    );
    // Note: generateRefreshToken already saves the new token in DB

    // 6. Build response with new cookies
    const payload = {
      id: userId,
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
    };

    const response = NextResponse.json({
      success: true,
      data: {
        accessToken: newAccessToken, // Return new token so client can update Authorization headers
        user: payload,
      },
    });

    // 7. Set httpOnly cookies
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { success: false, error: "Token refresh failed. Please login again.", message: "Token refresh failed. Please login again." },
      { status: 500 }
    );
  }
}
