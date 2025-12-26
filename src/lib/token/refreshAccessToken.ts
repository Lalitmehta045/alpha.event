import jwt from "jsonwebtoken";
import UserModel from "../models/User.model";

export async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const secret = process.env.SECRET_KEY_REFRESH_TOKEN;
    if (!secret) {
      throw new Error("JWT_REFRESH_SECRET is missing in env");
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, secret) as any;
    
    // Check if refresh token exists in DB
    const user = await UserModel.findOne({ 
      _id: decoded.id, 
      refresh_token: refreshToken 
    });
    
    if (!user) {
      throw new Error("Invalid refresh token");
    }

    // Generate new access token
    const { generateAccessToken } = await import("./generateAccessToken");
    const newAccessToken = await generateAccessToken(
      user._id.toString(),
      user.email,
      user.role
    );

    return newAccessToken;
  } catch (error: any) {
    console.error("Refresh token error:", error.message);
    return null;
  }
}
