import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User.model";
import { generateAccessToken } from "@/lib/token/generateAccessToken";
import { generateRefreshToken } from "@/lib/token/generateRefreshToken";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const callbackUrl = url.searchParams.get("callbackUrl") || "/";

    if (!session || !session.user || !session.user.email) {
      return NextResponse.redirect(new URL(`/auth/sign-in?error=NoSession`, req.url));
    }

    await connectDB();
    const user = await UserModel.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.redirect(new URL(`/auth/sign-in?error=UserNotFound`, req.url));
    }

    if (user.status !== "Active") {
      return NextResponse.redirect(new URL(`/auth/sign-in?error=AccountInactive`, req.url));
    }

    // Generate Custom JWTs identical to Credentials login
    const accessToken = await generateAccessToken(
      user._id.toString(),
      user.email,
      user.role
    );

    const refreshToken = await generateRefreshToken(
      user._id.toString(),
      user.email,
      user.role
    );

    // Persist refresh token to DB
    user.refresh_token = refreshToken;
    await user.save();

    // Redirect to the original callback
    const response = NextResponse.redirect(new URL(callbackUrl, req.url));

    // Set identical cookies
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60, // 15 mins
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Google Sync Error:", error);
    return NextResponse.redirect(new URL(`/auth/sign-in?error=SyncFailed`, req.url));
  }
}
