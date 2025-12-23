import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import UserModel from "@/lib/models/User.model";
import OTP from "@/lib/models/Otp.model";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { fname, lname, email, phone, password, confirmPassword, otp } =
      await req.json();

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
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
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
          { success: false, message: "Invalid mobile number characters." },
          { status: 400 }
        );
      }

      // Count digits only (ignore separators) and enforce 10-15 digits
      const digitCount = mobileStr.replace(/\D/g, "").length;
      if (digitCount < 10 || digitCount > 15) {
        return NextResponse.json(
          {
            success: false,
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
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // ✅ Get latest OTP
    const latestOtp = await OTP.findOne({ email }).sort({ createdAt: -1 });

    if (!latestOtp) {
      return NextResponse.json({ error: "OTP not found" }, { status: 400 });
    }

    // ✅ Check OTP expiration (2 minutes)
    const otpExpiry = latestOtp.createdAt.getTime() + 2 * 60 * 1000;

    if (Date.now() > otpExpiry) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    // ✅ Validate OTP
    if (latestOtp.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
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
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
