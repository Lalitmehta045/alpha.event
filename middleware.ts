import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 1. Define Public Routes (No login required)
const authRoutes = ["/auth/sign-in", "/auth/sign-up", "/verify-email"];

// 2. Define Role Access
// Note: We do not use [slug] here. We just check the folder prefix.
const roleAccess: Record<string, string[]> = {
  "SUPER-ADMIN": ["/admin"],
  ADMIN: ["/admin"],
  USER: [
    "/about",
    "/recent",
    "/contact",
    "/category",
    "/product",
    "/profile",
    "/orders",
    "/purchase-history",
    "/cart",
    // We handle "/" (home) separately in logic
  ],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- STEP 1: IGNORE STATIC ASSETS ---
  // Allow Next.js internals and static files to pass through immediately
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // checking for files like images, favicon.ico
  ) {
    return NextResponse.next();
  }

  // --- STEP 2: ALLOW AUTH PAGES ---
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // --- STEP 3: GET USER & TOKEN ---
  const accessToken = request.cookies.get("accessToken")?.value;
  const userData = request.cookies.get("user")?.value;

  // Safety check: If token exists but user data is corrupted
  let user = null;
  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (e) {
    // If JSON parse fails, force logout
    const response = NextResponse.redirect(
      new URL("/auth/sign-in", request.url)
    );
    response.cookies.delete("accessToken");
    response.cookies.delete("user");
    return response;
  }

  const role = user?.role;

  // --- STEP 4: GUEST HANDLING (Not Logged In) ---
  if (!accessToken || !role) {
    // If trying to access Admin or Profile protected routes -> Redirect to Login
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/orders")
    ) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url));
    }
    // Otherwise, allow guests to view public pages (Home, About, Products)
    return NextResponse.next();
  }

  // --- STEP 5: ROLE BASED ACCESS CONTROL ---

  // === SCENARIO A: ADMIN USER ===
  // if (role === "ADMIN" || role === "SUPER-ADMIN") {
  //   // Requirement: Admin can ONLY navigate paths starting with /admin
  //   if (!pathname.startsWith("/admin")) {
  //     return NextResponse.redirect(new URL("/admin", request.url));
  //   }
  //   return NextResponse.next();
  // }

  // === SCENARIO A: FOR SUPER ADMIN ===
  if (role === "SUPER-ADMIN") {
    // SUPER ADMIN can access all /admin routes
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
    // Requirement: User CANNOT go to /admin
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Allow everything else (because your (public) folder handles the rest)
    return NextResponse.next();
  }

  // Default fallback
  return NextResponse.next();
}

// --- CONFIGURATION ---
export const config = {
  // CRITICAL FIX: Matcher must catch ALL routes to protect them.
  // We exclude static files using negative lookahead in regex.
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
