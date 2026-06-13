import { NextRequest, NextResponse } from "next/server";
import otpGenerator from "otp-generator";
import { connectDB } from "@/lib/db";
import OTP from "@/lib/models/Otp.model";
import { sendMail } from "@/lib/mailSender";
import { verifyEmailTemplate } from "@/lib/emailTemplates/verifyEmail";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    let email;
    try {
      const body = await req.json();
      email = body.email;
    } catch (jsonError) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body", message: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required", message: "Email is required" },
        { status: 400 }
      );
    }

    // ✅ Generate 6-digit OTP
    let otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // ✅ Ensure unique OTP
    let exists = await OTP.findOne({ otp });
    while (exists) {
      otp = otpGenerator.generate(6, { digits: true });
      exists = await OTP.findOne({ otp });
    }

    // ✅ Save OTP
    await OTP.create({ email, otp });

    // ✅ Send Email
    await sendMail(
      email,
      "Alpha Events OTP Verification",
      verifyEmailTemplate(otp)
    );

    return NextResponse.json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (error: any) {
    console.error("Send-otp-email error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send OTP email. Please try again.", message: "Failed to send OTP email. Please try again." },
      { status: 500 }
    );
  }
}
