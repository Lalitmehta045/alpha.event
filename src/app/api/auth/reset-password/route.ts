import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User.model";
import OtpModel from "@/lib/models/Otp.model";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, newPassword, confirmPassword, otp } = await req.json();

    // ----------------------------------
    // 1️⃣ VALIDATE REQUIRED FIELDS
    // ----------------------------------
    if (!email || !newPassword || !confirmPassword || !otp) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // ----------------------------------
    // 2️⃣ PASSWORD MATCH CHECK
    // ----------------------------------
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 }
      );
    }

    // ----------------------------------
    // 3️⃣ CHECK USER EXISTS
    // ----------------------------------
    const user = await UserModel.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // ----------------------------------
    // 4️⃣ GET LATEST OTP FOR THIS EMAIL
    // ----------------------------------
    const latestOtp = await OtpModel.findOne({ email }).sort({ createdAt: -1 });

    if (!latestOtp) {
      return NextResponse.json(
        { success: false, message: "OTP not found" },
        { status: 400 }
      );
    }

    // ----------------------------------
    // 5️⃣ OTP EXPIRY CHECK (2 minutes)
    // ----------------------------------
    const otpExpiry = latestOtp.createdAt.getTime() + 2 * 60 * 1000;

    if (Date.now() > otpExpiry) {
      return NextResponse.json(
        { success: false, message: "OTP expired" },
        { status: 400 }
      );
    }

    // ----------------------------------
    // 6️⃣ OTP VALIDATION
    // ----------------------------------
    if (latestOtp.otp !== otp) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
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
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Password reset failed",
      },
      { status: 500 }
    );
  }
}
