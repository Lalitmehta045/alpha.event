import { NextRequest, NextResponse } from "next/server";
import otpGenerator from "otp-generator";
import { connectDB } from "@/lib/db";
import OTP from "@/lib/models/Otp.model";
import { sendMail } from "@/lib/mailSender";
import { verifyEmailTemplate } from "@/lib/emailTemplates/verifyEmail";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // ✅ Check if user exists
    // (OPTIONAL: prevent sending OTP if register already)
    // const existing = await UserModel.findOne({ email });
    // if (existing) return NextResponse.json({ error:"User already exists"}, { status: 400 });

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
      message: "OTP sent to email",
      // otp, // ❌ remove in production
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}
