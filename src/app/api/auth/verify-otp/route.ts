import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import UserModel from "@/lib/models/User.model";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { otp: userOtp } = await req.json();

    const otpCookie = req.cookies.get("otp_code")?.value;
    const phone = req.cookies.get("otp_phone")?.value;

    if (!otpCookie || !phone) {
      return NextResponse.json(
        { error: "OTP expired or missing" },
        { status: 400 }
      );
    }

    if (otpCookie !== userOtp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
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
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
