import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// 1. Define Public Routes (No login required)
const authRoutes = ["/auth/sign-in", "/auth/sign-up", "/verify-email"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- STEP 1: IGNORE STATIC ASSETS ---
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // --- STEP 2: ALLOW AUTH PAGES ---
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // --- STEP 3: VERIFY JWT FROM COOKIE ---
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  let role: string | null = null;

  if (accessToken) {
    try {
      const secret = new TextEncoder().encode(
        process.env.SECRET_KEY_ACCESS_TOKEN
      );
      const { payload } = await jwtVerify(accessToken, secret);
      role = payload.role as string;
    } catch (err: any) {
      // Access token expired or invalid, role remains null
    }
  }

  if (!role && refreshToken) {
    try {
      const refreshSecret = new TextEncoder().encode(
        process.env.SECRET_KEY_REFRESH_TOKEN
      );
      const { payload } = await jwtVerify(refreshToken, refreshSecret);
      role = payload.role as string;
    } catch {
      role = null;
    }
  }

  // --- STEP 4: GUEST HANDLING (Not Logged In) ---
  if (!role) {
    // If trying to access protected routes → Redirect to Login
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/orders") ||
      pathname.startsWith("/purchase-history")
    ) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }
    // Otherwise, allow guests to view public pages
    return NextResponse.next();
  }

  // --- STEP 5: ROLE BASED ACCESS CONTROL ---

  // === SCENARIO A: FOR SUPER ADMIN ===
  if (role === "SUPER-ADMIN") {
    if (!pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // === SCENARIO B: FOR ADMIN ===
  if (role === "ADMIN") {
    // Block Admin from SuperAdmin route
    if (pathname === "/admin/all-admins") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Admin allowed only inside /admin
    if (!pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  // === SCENARIO C: FOR STANDARD USER ===
  if (role === "USER") {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Default fallback
  return NextResponse.next();
}

// --- CONFIGURATION ---
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
