import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import UserModel from "@/lib/models/User.model";
import { connectDB } from "@/lib/db";
import { generateAccessToken } from "@/lib/token/generateAccessToken";
import { generateRefreshToken } from "@/lib/token/generateRefreshToken";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email & Password required" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "User does not exist" },
        { status: 404 }
      );
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
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

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    };

    const payload = {
      id: user._id.toString(),
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    const response = NextResponse.json({
      message: "Login successfull",
      data: {
        accessToken,
        refreshToken,
        user: payload,
      },
    });

    // ✅ Set secure cookies
    response.cookies.set("accessToken", accessToken, cookieOptions);
    response.cookies.set("refreshToken", refreshToken, cookieOptions);
    // 🔥 FIX: MUST stringify user object
    response.cookies.set("user", JSON.stringify(payload), cookieOptions);

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
