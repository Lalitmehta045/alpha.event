import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import UserModel from "@/lib/models/User.model";
import { connectDB } from "@/lib/db";
import { generateAccessToken } from "@/lib/token/generateAccessToken";
import { generateRefreshToken } from "@/lib/token/generateRefreshToken";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { data } = body; // This is the payload from MSG91 success callback

    console.log("MSG91 Login Payload:", data);

    let token = "";
    let mobile = "";

    // MSG91 success response can be a string (JWT) or an object containing the token
    if (typeof data === "string") {
      token = data;
    } else if (typeof data === "object" && data !== null) {
      token = data.response || data.token || data.message || "";
      if (data.mobile || data.phoneNumber) {
        mobile = data.mobile || data.phoneNumber;
      }
    }

    // If we have a token, try to decode it (MSG91 returns a JWT)
    if (token) {
      try {
        const decoded = jwt.decode(token) as any;
        console.log("Decoded MSG91 token:", decoded);
        if (decoded && (decoded.mobile || decoded.phoneNumber || decoded.sub)) {
          mobile = decoded.mobile || decoded.phoneNumber || decoded.sub;
        }
      } catch (err) {
        console.log("Could not decode MSG91 token as JWT");
      }
    }

    if (!mobile) {
      return NextResponse.json(
        { success: false, message: "Could not extract mobile number from MSG91 response." },
        { status: 400 }
      );
    }

    // Clean up mobile number
    let cleanPhone = String(mobile).replace(/\D/g, "");
    if (!cleanPhone.startsWith("91") && cleanPhone.length === 10) {
      cleanPhone = "91" + cleanPhone;
    }
    const phone = "+" + cleanPhone;

    await connectDB();

    let user = await UserModel.findOne({ phone });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      // Provide valid dummy data to satisfy Mongoose constraints
      const randomStr = Math.random().toString(36).slice(2, 10);
      const dummyEmail = `user_${cleanPhone}_${randomStr}@alpha-ae.local`;
      const dummyPassword = `OtpPass@${randomStr}`; // satisfies minlength: 6

      user = await UserModel.create({
        phone,
        email: dummyEmail,
        fname: "User",
        lname: "Mobile",
        password: dummyPassword,
        role: "USER",
        status: "Active",
      });
    }

    const userId = user._id.toString();

    // Generate tokens
    const accessToken = await generateAccessToken(userId, user.email || phone, user.role);
    const refreshToken = await generateRefreshToken(userId, user.email || phone, user.role);

    await UserModel.updateOne({ _id: user._id }, { last_login_date: new Date() });

    const payload = {
      id: user._id.toString(),
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone,
    };

    const response = NextResponse.json({
      success: true,
      message: "Mobile Login successful",
      data: {
        accessToken,
        refreshToken,
        user: payload,
        isNewUser,
      },
    });

    // Set auth cookies
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60,
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error("MSG91 login error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during mobile login." },
      { status: 500 }
    );
  }
}
