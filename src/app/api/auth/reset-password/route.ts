import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User.model";
import OtpModel from "@/lib/models/Otp.model";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    let email, newPassword, confirmPassword, otp;
    try {
      const body = await req.json();
      email = body.email;
      newPassword = body.newPassword;
      confirmPassword = body.confirmPassword;
      otp = body.otp;
    } catch (jsonError) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body", message: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    // ----------------------------------
    // 1️⃣ VALIDATE REQUIRED FIELDS
    // ----------------------------------
    if (!email || !newPassword || !confirmPassword || !otp) {
      return NextResponse.json(
        { success: false, error: "All fields are required", message: "All fields are required" },
        { status: 400 }
      );
    }

    // ----------------------------------
    // 2️⃣ PASSWORD MATCH CHECK
    // ----------------------------------
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match", message: "Passwords do not match" },
        { status: 400 }
      );
    }

    // ----------------------------------
    // 3️⃣ CHECK USER EXISTS
    // ----------------------------------
    const user = await UserModel.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found", message: "User not found" },
        { status: 404 }
      );
    }

    // ----------------------------------
    // 4️⃣ GET LATEST OTP FOR THIS EMAIL
    // ----------------------------------
    const latestOtp = await OtpModel.findOne({ email }).sort({ createdAt: -1 });

    if (!latestOtp) {
      return NextResponse.json(
        { success: false, error: "OTP not found", message: "OTP not found" },
        { status: 400 }
      );
    }

    // ----------------------------------
    // 5️⃣ OTP EXPIRY CHECK (2 minutes)
    // ----------------------------------
    const otpExpiry = latestOtp.createdAt.getTime() + 2 * 60 * 1000;

    if (Date.now() > otpExpiry) {
      return NextResponse.json(
        { success: false, error: "OTP expired", message: "OTP expired" },
        { status: 400 }
      );
    }

    // ----------------------------------
    // 6️⃣ OTP VALIDATION
    // ----------------------------------
    if (latestOtp.otp !== otp) {
      return NextResponse.json(
        { success: false, error: "Invalid OTP", message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // ----------------------------------
    // 7️⃣ HASH NEW PASSWORD
    // ----------------------------------
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ----------------------------------
    // 8️⃣ UPDATE USER PASSWORD + CLEAR RESET FIELDS
    // ----------------------------------
    user.password = hashedPassword;
    user.forgot_password_otp = null;
    user.forgot_password_expiry = null;

    await user.save();

    // ----------------------------------
    // 9️⃣ SUCCESS RESPONSE
    // ----------------------------------
    return NextResponse.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error: any) {
    console.error("Reset-password error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Password reset failed. Please try again.",
        message: "Password reset failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
