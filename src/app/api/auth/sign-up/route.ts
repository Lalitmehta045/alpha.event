import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import UserModel from "@/lib/models/User.model";
import OTP from "@/lib/models/Otp.model";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    let fname, lname, email, phone, password, confirmPassword, otp, role;
    try {
      const body = await req.json();
      fname = body.fname;
      lname = body.lname;
      email = body.email;
      phone = body.phone;
      password = body.password;
      confirmPassword = body.confirmPassword;
      otp = body.otp;
      role = body.role || "USER";
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
      if (role === "VENDOR" && existingUser.role === "USER") {
        // User exists as a normal USER, allow them to upgrade to VENDOR
        // Proceed with registration flow to update their details
      } else if (existingUser.role === "VENDOR" || existingUser.role === "ADMIN" || existingUser.role === "SUPER-ADMIN") {
        return NextResponse.json(
          { success: false, error: "An account with this email already exists and is not a standard user.", message: "An account with this email already exists and is not a standard user." },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: "User already exists", message: "User already exists" },
          { status: 400 }
        );
      }
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

    // ✅ Create or Update user
    let user;
    if (existingUser && role === "VENDOR" && existingUser.role === "USER") {
      user = await UserModel.findByIdAndUpdate(
        existingUser._id,
        {
          fname,
          lname,
          phone: mobileStr,
          password: hashedPassword,
          role: "VENDOR",
          verify_email: true,
          profileCompleted: true,
        },
        { new: true }
      );
    } else {
      user = await UserModel.create({
        fname,
        lname,
        email,
        phone: mobileStr,
        password: hashedPassword,
        role: role,
        verify_email: true,
        profileCompleted: true,
      });
    }

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
