# Complete Authentication Analysis & Codebase Context\n\nThis document provides a comprehensive analysis of the authentication mechanism used in this project, the complete folder structure, and the **actual source code** of all files related to authentication. This is intended to give a complete context of the authentication flow.\n\n---\n\n## 1. Authentication Architecture Overview\n\nThe application uses a **hybrid authentication approach**, combining **NextAuth.js** and a **Custom JWT strategy** with HTTP-only cookies. It also implements **Role-Based Access Control (RBAC)** via Next.js Middleware.\n\n### Technologies & Services Used:\n- **NextAuth.js**: Used primarily for Google OAuth integration.\n- **Custom JWT (jose)**: Used for manual token verification in the Edge Middleware.\n- **Bcrypt.js**: For password hashing and verification.\n- **MSG91**: Integrated for Mobile Number / OTP based login.\n- **MongoDB (Mongoose)**: The database used to store users (`User.model.ts`).\n\n---\n\n## 2. Key Authentication Files & Their Roles\n\n- `src/lib/auth.ts`: NextAuth Configuration.\n- `src/app/api/auth/sign-in/route.ts`: Custom Login API (generates JWT cookies).\n- `middleware.ts`: Route Protection & RBAC (verifies JWT cookies).\n- `src/components/auth/AuthForm.tsx`: Frontend UI for Login/Registration and Mobile OTP integration.\n- `src/lib/models/User.model.ts`: Database Schema for Users.\n- `src/services/operations/auth.ts`: Frontend API calls for auth.\n- `src/app/api/auth/[...nextauth]/route.ts`: NextAuth route handler.\n- `src/app/api/auth/verify-otp/route.ts`: OTP verification backend.\n---\n\n## 3. Full Source Code of Authentication Files\n\n### File: src/lib/auth.ts\n**Full Path**: `c:\Users\HP-PC\Downloads\alpha-ae-web\src\lib\auth.ts`\n\n```typescript\nimport { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "./db";
import User from "@/lib/models/User.model";
import bcrypt from "bcryptjs";
import { IUserProfile } from "@/@types/user";
import crypto from "crypto";

export const authOptions: NextAuthOptions = {
  // Rely on env secret so callbacks/redirects use the correct host in prod
  secret: process.env.NEXTAUTH_SECRET,
  session: { 
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days — aligned with refresh token expiry
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({
          email: credentials?.email,
        }).lean() as IUserProfile | null;
        if (!user) return null;

        const ok = await bcrypt.compare(credentials!.password, user.password);
        if (!ok) return null;

        return {
          id: String(user._id),
          email: user.email,
          fname: user.fname,
          lname: user.lname,
          role: user.role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // ✅ When Google login happens, ensure user exists in our MongoDB
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;

      await connectDB();

      const email = user.email;
      if (!email) return false;

      let existing = await User.findOne({ email });

      if (!existing) {
        const randomPassword = crypto.randomBytes(32).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        existing = await User.create({
          fname: (profile as any)?.given_name || "Google",
          lname: (profile as any)?.family_name || "User",
          email,
          password: hashedPassword,
          avatar: (profile as any)?.picture || "",
          role: "USER",
          status: "Active",
          verify_email: true,
          profileCompleted: false,
        });
      }

      // Attach DB info to NextAuth user
      (user as any).id = existing._id.toString();
      (user as any).role = existing.role;

      return true;
    },

    async redirect({ url, baseUrl }) {
      // Ensure redirects stay on the allowed host to avoid redirect_uri_mismatch
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const target = new URL(url);
        if (target.origin === baseUrl) return url;
      } catch {
        // fall through to baseUrl
      }
      return baseUrl;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      (session.user as any).id = token.id;
      (session.user as any).role = token.role;
      return session;
    },
  },

  pages: { signIn: "/auth/sign-in" },
};
\n```\n\n### File: middleware.ts\n**Full Path**: `c:\Users\HP-PC\Downloads\alpha-ae-web\middleware.ts`\n\n```typescript\nimport { NextResponse } from "next/server";
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
\n```\n\n### File: src/app/api/auth/sign-in/route.ts\n**Full Path**: `c:\Users\HP-PC\Downloads\alpha-ae-web\src\app\api\auth\sign-in\route.ts`\n\n```typescript\nimport { NextRequest, NextResponse } from "next/server";
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
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, // 15 minutes — matches JWT expiry
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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

\n```\n\n### File: src/app/api/auth/sign-up/route.ts\n**Full Path**: `c:\Users\HP-PC\Downloads\alpha-ae-web\src\app\api\auth\sign-up\route.ts`\n\n```typescript\nimport { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import UserModel from "@/lib/models/User.model";
import OTP from "@/lib/models/Otp.model";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    let fname, lname, email, phone, password, confirmPassword, otp;
    try {
      const body = await req.json();
      fname = body.fname;
      lname = body.lname;
      email = body.email;
      phone = body.phone;
      password = body.password;
      confirmPassword = body.confirmPassword;
      otp = body.otp;
    } catch (jsonError) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body", message: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    // ✅ Validate fields
    if (
      !fname ||
      !lname ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return NextResponse.json(
        { success: false, error: "All fields are required", message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match", message: "Passwords do not match" },
        { status: 400 }
      );
    }

    // 📌 Validate mobile number (optional)
    // Force mobile to string (preserve formatting) and trim
    const mobileStr = phone ? String(phone).trim() : null;

    if (mobileStr) {
      // Allowed characters: +, digits, spaces, hyphens, parentheses
      if (!/^[+\d][\d\s\-()]*$/.test(mobileStr)) {
        return NextResponse.json(
          { success: false, error: "Invalid mobile number characters.", message: "Invalid mobile number characters." },
          { status: 400 }
        );
      }

      // Count digits only (ignore separators) and enforce 10-15 digits
      const digitCount = mobileStr.replace(/\D/g, "").length;
      if (digitCount < 10 || digitCount > 15) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid mobile number length (should have 10–15 digits).",
            message: "Invalid mobile number length (should have 10–15 digits).",
          },
          { status: 400 }
        );
      }
    }

    // ✅ Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "User already exists", message: "User already exists" },
        { status: 400 }
      );
    }

    // ✅ Get latest OTP
    const latestOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!latestOtp) {
      return NextResponse.json(
        { success: false, error: "OTP not found", message: "OTP not found" },
        { status: 400 }
      );
    }

    // ✅ Check OTP expiration (2 minutes)
    const otpExpiry = latestOtp.createdAt.getTime() + 2 * 60 * 1000;

    if (Date.now() > otpExpiry) {
      return NextResponse.json(
        { success: false, error: "OTP expired", message: "OTP expired" },
        { status: 400 }
      );
    }

    // ✅ Validate OTP
    if (latestOtp.otp !== otp) {
      return NextResponse.json(
        { success: false, error: "Invalid OTP", message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const user = await UserModel.create({
      fname,
      lname, // ✅ FIX — mapped correctly to your UserModel
      email,
      phone: mobileStr,
      password: hashedPassword,
      role: "USER",
      verify_email: true,
      profileCompleted: true,
    });

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        phone: user.phone,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (error: any) {
    console.error("Sign-up error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during registration. Please try again.", message: "An unexpected error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
\n```\n\n### File: src/components/auth/AuthForm.tsx\n**Full Path**: `c:\Users\HP-PC\Downloads\alpha-ae-web\src\components\auth\AuthForm.tsx`\n\n```typescript\n"use client";

import Script from "next/script";

import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { sendOtp, signIn, msg91SignIn } from "@/services/operations/auth";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiSmartphone, FiMail } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { CardContent, CardFooter } from "../ui/card";
import Image from "next/image";
import googleImg from "@/assets/images/googleImg.png";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import PencilLoader from "../common/PencilLoader";
import countryCode from "@/assets/data/countryCode.json";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { setLoginProvider } from "@/redux/slices/authSlice";

export default function AuthForm({
  isSignUp,
  isSignIn,
}: {
  isSignUp: boolean;
  isSignIn: boolean;
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  const form = useForm({
    mode: "onChange", // 🔥 real-time validation
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Find default Indian country
  const defaultCountry = countryCode.find((c) => c.flag === "🇮🇳");

  const defaultSelectValue = defaultCountry
    ? `${defaultCountry.code}-${defaultCountry.id}`
    : "";

  const [selectedCountryCode, setSelectedCountryCode] = useState(
    defaultCountry?.code || "+91"
  );

  const [selectValue, setSelectValue] = useState(defaultSelectValue);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");

  const handleMsg91LoginToggle = () => {
    setLoginMethod(prev => prev === "email" ? "phone" : "email");
    // Clear form errors when switching
    form.clearErrors();
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    let keepLoading = false;
    try {
      const nameParts = (data.fullName || "").trim().split(" ");
      const fname = nameParts[0] || "";
      const lname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      const finalData = {
        ...data,
        fname,
        lname,
        phone: selectedCountryCode + " " + data.phone,
      };

      if (isSignUp) {
        await sendOtp(finalData.email, router);
        localStorage.setItem("pendingUser", JSON.stringify(finalData));
        router.push("/verify-email");
      } else {
        if (loginMethod === "phone") {
          keepLoading = true;
          // Initialize MSG91 widget with the entered phone number
          const config = {
            widgetId: process.env.NEXT_PUBLIC_MSG91_WIDGET_ID,
            tokenAuth: process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH,
            identifier: finalData.phone,
            success: async (responseData: any) => {
              console.log("success response", responseData);
              toast.success("OTP Verified Successfully!");
              // Send the known mobile number to the backend
              await msg91SignIn({ ...responseData, mobile: finalData.phone }, router, dispatch);
              setIsLoading(false);
            },
            failure: (error: any) => {
              console.log("failure reason", error);
              toast.error(error?.message || "OTP verification failed");
              setIsLoading(false);
            },
          };

          if (typeof window !== "undefined" && (window as any).initSendOTP) {
            (window as any).initSendOTP(config);
          } else {
            const urls = [
              "https://verify.msg91.com/otp-provider.js",
              "https://verify.phone91.com/otp-provider.js",
            ];
            let i = 0;
            const attempt = () => {
              const s = document.createElement("script");
              s.src = urls[i];
              s.async = true;
              s.onload = () => {
                if (typeof (window as any).initSendOTP === "function") {
                  (window as any).initSendOTP(config);
                }
              };
              s.onerror = () => {
                i++;
                if (i < urls.length) {
                  attempt();
                } else {
                  setIsLoading(false);
                  toast.error("Failed to load OTP service.");
                }
              };
              document.head.appendChild(s);
            };
            attempt();
          }
        } else {
          await signIn(data.email, data.password, router, dispatch);
        }
      }
    } finally {
      if (!keepLoading) {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <Script src="https://verify.msg91.com/otp-provider.js" strategy="afterInteractive" />
      <CardContent className="px-4 md:px-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            {/* FULL NAME */}
            {isSignUp && (
              <FormField
                control={form.control}
                name="fullName"
                rules={{
                  required: "Full Name is required",
                  minLength: { value: 3, message: "Minimum 3 characters" },
                  pattern: {
                    value: /^[A-Za-z ]+$/,
                    message: "Only alphabets are allowed",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="John Doe" className="h-13" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* EMAIL FIELD */}
            {(isSignUp || loginMethod === "email") && (
              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="you@example.com"
                        className="h-13"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* PHONE (SignUp Only or Mobile Login) */}
            {(isSignUp || loginMethod === "phone") && (
              <FormField
                control={form.control}
                name="phone"
                rules={{
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Phone number must be exactly 10 digits",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile No.</FormLabel>

                    {/* Flex row for Country Code + Phone Input */}
                    <div className="flex gap-3">
                      {/* COUNTRY CODE SELECT */}
                      <Select
                        value={selectValue}
                        onValueChange={(val) => {
                          setSelectValue(val);
                          setSelectedCountryCode(val.split("-")[0]); // store only "+91"
                        }}
                      >
                        <SelectTrigger className="w-32 h-13! py-5 border-gray-400">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>

                        <SelectContent>
                          {countryCode.map((item) => (
                            <SelectItem
                              key={item.id}
                              value={`${item.code}-${item.id}`}
                            >
                              <span className="mr-2">{item.flag}</span>
                              {item.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* PHONE INPUT */}
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          maxLength={10}
                          placeholder="1234567890"
                          className="h-13 flex-1 focus-visible:ring-2 focus-visible:ring-blue-300"
                        />
                      </FormControl>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* PASSWORD */}
            {(isSignUp || loginMethod === "email") && (
              <FormField
                control={form.control}
                name="password"
                rules={{
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
                    message: "Password must contain letters & numbers",
                  },
                }}
                render={({ field }) => (
                  <FormItem className="mb-1">
                    <FormLabel>Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="h-13 pr-10"
                        />
                      </FormControl>
  
                      {/* Eye Button */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isSignIn && loginMethod === "email" && (
              <div className="w-full text-end">
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-sm font-medium text-blue-500 hover:text-blue-700 cursor-pointer transition-colors"
                >
                  Forget Password?
                </button>
              </div>
            )}

            {/* CONFIRM PASSWORD */}
            {isSignUp && (
              <FormField
                control={form.control}
                name="confirmPassword"
                rules={{
                  required: "Confirm Password is required",
                  validate: (val) =>
                    val === form.getValues("password") ||
                    "Passwords do not match",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          type={showConfirm ? "text" : "password"}
                          placeholder="Re-enter password"
                          className="h-13 pr-10"
                        />
                      </FormControl>

                      {/* Eye Button */}
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showConfirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              disabled={!form.formState.isValid || isLoading}
              className="w-full cursor-pointer disabled:cursor-no-drop bg-indigo-600 hover:bg-indigo-700 text-white h-11 disabled:opacity-40 relative"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="scale-50">
                    <PencilLoader />
                  </span>
                  <span>
                    {isSignUp 
                      ? "Creating Account..." 
                      : loginMethod === "phone" 
                        ? "Sending OTP..." 
                        : "Signing In..."}
                  </span>
                </span>
              ) : (
                <span>
                  {isSignUp 
                    ? "Create Account" 
                    : loginMethod === "phone" 
                      ? "Send OTP" 
                      : "Log-In"}
                </span>
              )}
            </Button>
          </form>
        </Form>

        {/* Mobile/Email Toggle Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full mt-4 flex items-center justify-center gap-2 h-11 border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
          onClick={handleMsg91LoginToggle}
        >
          {loginMethod === "email" ? (
            <>
              <FiSmartphone size={18} />
              <span className="font-medium">Login with Mobile Number</span>
            </>
          ) : (
            <>
              <FiMail size={18} />
              <span className="font-medium">Login with Email</span>
            </>
          )}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-2 my-6">
          <Separator className="flex-1 bg-gray-300" />
          <span className="text-gray-400 text-sm">Or</span>
          <Separator className="flex-1 bg-gray-300" />
        </div>

        {/* Social Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            type="button"
            className="w-16 h-14 rounded-xl p-2 cursor-pointer"
            onClick={() => {
              dispatch(setLoginProvider("google"));
              nextAuthSignIn("google", { callbackUrl: "/" });
            }}
          >
            <Image src={googleImg} alt="google" />
          </Button>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex justify-center text-sm pb-6">
        <p>
          {isSignUp ? "Already have an account?" : "Don’t have an account?"}
          <button
            onClick={() =>
              router.push(isSignUp ? "/auth/sign-in" : "/auth/sign-up")
            }
            className="text-indigo-600 font-bold cursor-pointer"
          >
            {isSignUp ? "Log-In" : "Create Account"}
          </button>
        </p>
      </CardFooter>
    </>
  );
}
\n```\n\n### File: src/lib/models/User.model.ts\n**Full Path**: `c:\Users\HP-PC\Downloads\alpha-ae-web\src\lib\models\User.model.ts`\n\n```typescript\nimport mongoose, { Schema } from "mongoose";
import { IUserProfile } from "@/@types/user";

const UserSchema = new Schema<IUserProfile>(
  {
    fname: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lname: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    avatar: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: null,
    },
    refresh_token: {
      type: String,
      default: "",
    },
    verify_email: {
      type: Boolean,
      default: false,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    last_login_date: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended"],
      default: "Active",
    },
    address_details: [
      {
        type: Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
    shopping_cart: [
      {
        type: Schema.Types.ObjectId,
        ref: "Cart",
      },
    ],
    orderHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    forgot_password_otp: {
      type: String,
      default: null,
    },
    forgot_password_expiry: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["SUPER-ADMIN", "ADMIN", "USER"],
      default: "USER",
    },
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models as any).User ||
  mongoose.model<IUserProfile>("User", UserSchema);
\n```\n\n### File: src/services/operations/auth.ts\n**Full Path**: `c:\Users\HP-PC\Downloads\alpha-ae-web\src\services\operations\auth.ts`\n\n```typescript\n"use client";

import { toast } from "react-hot-toast";
import { endpoints } from "../api_endpoints";
import { apiConnector } from "../apiconnector";
import { setLoginProvider, setToken, setUser } from "@/redux/slices/authSlice";
import { logoutAction } from "@/actions/auth";
import { getGuestCartForSync, hasGuestCart, clearGuestCart } from "@/utils/guestCart";
import { syncCartAfterLogin, getAllCartItems } from "./cartItem";
import { handleAddItemCart } from "@/redux/slices/cartSlice";

const { SENDOTPEMAIL_API, SIGNUP_API, SIGNIN_API, RESETPASSWORD_API, MSG91_LOGIN_API } =
  endpoints;

// ✅ SEND OTP
export async function sendOtp(email: string, router: any) {
  const toastId = toast.loading("📧 Sending verification code...");

  try {
    const response = await apiConnector("POST", SENDOTPEMAIL_API, {
      email,
      checkUserPresent: true,
    });

    if (!response?.data) {
      toast.dismiss(toastId);
      toast.error("Unable to send verification code. Please try again.");
      return null;
    }

    toast.success("✅ Verification code sent successfully! Check your email.");

    router.push("/verify-email");
    return response.data;

  } catch (err: any) {
    const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Failed to send verification code. Please try again.";
    toast.error(errMsg);
    return null;
  } finally {
    toast.dismiss(toastId);
  }
}

// ✅ SIGN UP
export async function signUp(
  fname: string,
  lname: string,
  email: string,
  phone: number,
  password: string,
  confirmPassword: string,
  otp: number,
  router: any
) {
  const toastId = toast.loading("🔐 Creating your account...");

  try {
    const response = await apiConnector("POST", SIGNUP_API, {
      fname,
      lname,
      email,
      phone,
      password,
      confirmPassword,
      otp,
    });

    if (!response.data.success) {
      toast.dismiss(toastId);
      toast.error("Registration failed. Please check your details and try again.");
      console.log("Registration Error: ", response.data.error);
      return;
    }

    toast.dismiss(toastId);
    toast.success("🎉 Account created successfully! Please sign in to continue.");

    router.push("/auth/sign-in");

  } catch (err: any) {
    toast.dismiss(toastId);
    const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Registration failed. Please try again.";
    toast.error(errMsg);
  }
}

// ✅ SIGN IN — tokens are now stored in httpOnly cookies by the server
export async function signIn(
  email: string,
  password: string,
  router: any,
  dispatch: any
) {
  const toastId = toast.loading("🔐 Signing you in...");

  try {
    const response = await apiConnector("POST", SIGNIN_API, {
      email,
      password,
    });

    if (!response?.data?.data) {
      toast.dismiss(toastId);
      toast.error("Invalid credentials. Please check your email and password.");
      return null;
    }

    const { accessToken, user } = response.data.data;

    // ✅ Store user info for UI display only (non-sensitive data)
    localStorage.setItem("user", JSON.stringify(user));

    // ✅ Update Redux state
    dispatch(setUser(user));
    dispatch(setToken(accessToken)); // Keep in Redux for service files using Authorization header
    dispatch(setLoginProvider("credentials"));

    // ✅ Sync guest cart to server after login
    if (hasGuestCart()) {
      const guestItems = getGuestCartForSync();
      await syncCartAfterLogin(guestItems, dispatch, accessToken);
    } else {
      // No guest cart, just load the server cart
      const serverCart = await getAllCartItems(accessToken);
      dispatch(handleAddItemCart(serverCart));
    }

    toast.dismiss(toastId);
    toast.success(`🎉 Welcome back, ${user.fname}!`);

    // ✅ Redirect to callbackUrl if present, otherwise default route
    const isAdmin = ["ADMIN", "SUPER-ADMIN"].includes(user.role);
    const callbackUrl = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("callbackUrl")
      : null;
    router.push(callbackUrl || (isAdmin ? "/admin" : "/"));

    return response.data;

  } catch (err: any) {
    toast.dismiss(toastId);
    const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Login failed. Please try again.";
    
    // Redirect to create account if user doesn't exist
    if (errMsg.toLowerCase().includes("user does not exist")) {
      toast.error("User does not exist. Please create an account.");
      router.push("/auth/sign-up");
    } else {
      toast.error(errMsg);
    }
    
    return null;
  }
}

// ✅ MSG91 MOBILE LOGIN
export async function msg91SignIn(
  data: any,
  router: any,
  dispatch: any
) {
  const toastId = toast.loading("🔐 Verifying and signing you in...");

  try {
    const response = await apiConnector("POST", MSG91_LOGIN_API, {
      data,
    });

    if (!response?.data?.data) {
      toast.dismiss(toastId);
      toast.error("Mobile Login failed. Please try again.");
      return null;
    }

    const { accessToken, user, isNewUser } = response.data.data;

    // ✅ Store user info for UI display only (non-sensitive data)
    localStorage.setItem("user", JSON.stringify(user));

    // ✅ Update Redux state
    dispatch(setUser(user));
    dispatch(setToken(accessToken)); // Keep in Redux for service files using Authorization header
    dispatch(setLoginProvider("credentials"));

    // ✅ Sync guest cart to server after login
    if (hasGuestCart()) {
      const guestItems = getGuestCartForSync();
      await syncCartAfterLogin(guestItems, dispatch, accessToken);
    } else {
      // No guest cart, just load the server cart
      const serverCart = await getAllCartItems(accessToken);
      dispatch(handleAddItemCart(serverCart));
    }

    toast.dismiss(toastId);
    toast.success(`🎉 Mobile Login successful!`);

    // ✅ Redirect to callbackUrl if present, otherwise default route
    const isAdmin = ["ADMIN", "SUPER-ADMIN"].includes(user.role);
    const callbackUrl = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("callbackUrl")
      : null;
    router.push(callbackUrl || (isAdmin ? "/admin" : "/"));

    return response.data;

  } catch (err: any) {
    toast.dismiss(toastId);
    const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Login failed. Please try again.";
    toast.error(errMsg);
    return null;
  }
}


export async function logout(router: any, dispatch: any) {
  const toastId = toast.loading("👋 Logging you out...");

  try {
    // ✅ Server-side: clear cookies + invalidate refresh token in DB
    await logoutAction();

    // ✅ Client-side: clear all storage
    sessionStorage.clear();
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("loginProvider");

    // ✅ Clear Redux state completely
    dispatch(setUser(null));
    dispatch(setToken(null));
    dispatch(setLoginProvider(null));

    toast.dismiss(toastId);
    toast.success("Logged out successfully. See you soon!");

    router.refresh();
    router.replace("/auth/sign-in");
  } catch (err) {
    toast.dismiss(toastId);
    toast.error("Unable to logout. Please try again.");
    console.error("Logout Error:", err);
  }
}

export async function resetPasswordService(
  email: string,
  newPassword: string,
  confirmPassword: string,
  otp: Number,
  router: any
) {
  const toastId = toast.loading("🔒 Updating your password...");

  try {
    const response = await apiConnector("POST", RESETPASSWORD_API, {
      email,
      newPassword,
      confirmPassword,
      otp,
    });

    if (!response?.data?.success) {
      toast.dismiss(toastId);
      toast.error("Password reset failed. Please try again.");
      console.log("Reset Password error: ", response.data.message);
      return null;
    }

    toast.dismiss(toastId);
    toast.success("🎉 Password updated successfully! You can now sign in with your new password.");

    router.push("/auth/sign-in");

    return response.data;

  } catch (err: any) {
    toast.dismiss(toastId);
    const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Password reset failed. Please try again.";
    toast.error(errMsg);
    console.error("Reset Password error: ", err);
    return null;
  }
}
\n```\n\n### File: src/app/api/auth/[...nextauth]/route.ts\n**Full Path**: `c:\Users\HP-PC\Downloads\alpha-ae-web\src\app\api\auth\[...nextauth]\route.ts`\n\n```typescript\nimport NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
\n```\n\n### File: src/app/api/auth/verify-otp/route.ts\n**Full Path**: `c:\Users\HP-PC\Downloads\alpha-ae-web\src\app\api\auth\verify-otp\route.ts`\n\n```typescript\nimport { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import UserModel from "@/lib/models/User.model";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    let userOtp;
    try {
      const body = await req.json();
      userOtp = body.otp;
    } catch (jsonError) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body", message: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const otpCookie = req.cookies.get("otp_code")?.value;
    const phone = req.cookies.get("otp_phone")?.value;

    if (!otpCookie || !phone) {
      return NextResponse.json(
        { success: false, error: "OTP expired or missing", message: "OTP expired or missing" },
        { status: 400 }
      );
    }

    if (otpCookie !== userOtp) {
      return NextResponse.json(
        { success: false, error: "Invalid OTP", message: "Invalid OTP" },
        { status: 400 }
      );
    }

    await connectDB();

    let user = await UserModel.findOne({ phone });

    // ✅ Auto-create user if not exists (Phone-based login)
    if (!user) {
      user = await UserModel.create({
        phone,
        email: "",
        name: "",
        password: "",
      });
    }

    const token = jwt.sign(
      { id: user._id, phone: user.phone },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      message: "OTP verified",
      user,
      token,
    });

    // ✅ Set auth cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    // ✅ Clear OTP cookies
    response.cookies.set("otp_code", "", { maxAge: 0 });
    response.cookies.set("otp_phone", "", { maxAge: 0 });

    return response;
  } catch (err: any) {
    console.error("Verify-otp error:", err);
    return NextResponse.json(
      { success: false, error: "Verification failed. Please try again.", message: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}
\n```\n\n---\n\n## 4. Complete Project File & Folder Structure\n\nBelow is the complete tree structure of the project files.\n\n```text\n\n```\n