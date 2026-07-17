import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User.model";
import { generateAccessToken } from "@/lib/token/generateAccessToken";
import { generateRefreshToken } from "@/lib/token/generateRefreshToken";

/**
 * Resolves the canonical public-facing origin for redirects.
 * Priority:
 *   1. NEXTAUTH_URL env var (most reliable in production)
 *   2. x-forwarded-host + x-forwarded-proto (reverse proxy headers)
 *   3. host header
 *   4. req.url (development fallback only)
 */
function getCanonicalOrigin(req: NextRequest): string {
  // 1. NEXTAUTH_URL — set explicitly in production .env
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl) {
    return nextAuthUrl.replace(/\/$/, "");
  }

  const proto = req.headers.get("x-forwarded-proto") || "http";

  // 2. x-forwarded-proto + x-forwarded-host (Nginx / reverse proxy)
  const xForwardedHost = req.headers.get("x-forwarded-host");
  if (xForwardedHost) {
    return `${proto}://${xForwardedHost}`;
  }

  // 3. x-forwarded-proto + host
  const host = req.headers.get("host");
  if (host) {
    return `${proto}://${host}`;
  }

  // 4. req.url origin (development fallback only — may be 0.0.0.0 in Docker!)
  try {
    return new URL(req.url).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export async function GET(req: NextRequest) {
  try {
    const canonicalOrigin = getCanonicalOrigin(req);

    // ===== TEMPORARY DEBUG LOGS — REMOVE AFTER PRODUCTION VERIFICATION =====
    console.log("===== GOOGLE-SYNC DEBUG START =====");
    console.log("req.url:", req.url);
    console.log("req.nextUrl.toString():", req.nextUrl.toString());
    console.log("req.nextUrl.origin:", req.nextUrl.origin);
    console.log("process.env.NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
    console.log("process.env.AUTH_URL:", process.env.AUTH_URL);
    console.log("headers.host:", req.headers.get("host"));
    console.log("headers.x-forwarded-host:", req.headers.get("x-forwarded-host"));
    console.log("headers.x-forwarded-proto:", req.headers.get("x-forwarded-proto"));
    console.log("headers.origin:", req.headers.get("origin"));
    console.log("headers.referer:", req.headers.get("referer"));
    console.log("canonicalOrigin (resolved):", canonicalOrigin);
    // ===== END DEBUG LOGS =====

    const session = await getServerSession(authOptions);
    const url = new URL(req.url);
    const callbackUrl = url.searchParams.get("callbackUrl") || "/";
    console.log("callbackUrl (parsed):", callbackUrl);
    console.log("redirect target (FIXED):", new URL(callbackUrl, canonicalOrigin).toString());
    console.log("redirect target (OLD/broken):", new URL(callbackUrl, req.url).toString());
    console.log("===== GOOGLE-SYNC DEBUG END =====");

    if (!session || !session.user || !session.user.email) {
      return NextResponse.redirect(new URL(`/auth/sign-in?error=NoSession`, canonicalOrigin));
    }

    await connectDB();
    const user = await UserModel.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.redirect(new URL(`/auth/sign-in?error=UserNotFound`, canonicalOrigin));
    }

    if (user.status !== "Active") {
      return NextResponse.redirect(new URL(`/auth/sign-in?error=AccountInactive`, canonicalOrigin));
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

    // Redirect to the original callback using canonical origin (NOT req.url)
    const response = NextResponse.redirect(new URL(callbackUrl, canonicalOrigin));

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
    const fallbackOrigin = getCanonicalOrigin(req);
    return NextResponse.redirect(new URL(`/auth/sign-in?error=SyncFailed`, fallbackOrigin));
  }
}
