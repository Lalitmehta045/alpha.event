import jwt from "jsonwebtoken";
import UserModel from "../models/User.model";

export async function generateRefreshToken(
  userId: string,
  email: string,
  role: string
): Promise<string> {
  const secret = process.env.SECRET_KEY_REFRESH_TOKEN;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is missing in env");
  }

  const payload = {
    id: userId,
    email,
    role,
  };

  // ✅ Create refresh token
  const token = jwt.sign(payload, secret, { expiresIn: "7d" });

  // ✅ Store refresh token in DB
  await UserModel.updateOne({ _id: userId }, { refresh_token: token });

  return token;
}
