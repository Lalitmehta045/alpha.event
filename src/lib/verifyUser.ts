import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export const verifyUser = (req: NextRequest) => {
  try {
    const token =
      req.cookies.get("accessToken")?.value ||
      req.headers.get("authorization")?.split(" ")[1];

    if (!token) return null;

    const decoded = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN!) as {
      id: string;
      role: string;
      email?: string;
    };

    return {
      userId: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };
  } catch (err) {
    return null;
  }
};
