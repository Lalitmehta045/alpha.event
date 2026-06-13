// /lib/adminGuard.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { ACCOUNT_TYPE } from "@/utils/constant";
import { verifyUser } from "./verifyUser";

export async function ensureAdmin(req: NextRequest) {
  try {
    // Try Authorization header first, then fall back to httpOnly cookie
    const authHeader = req.headers.get("authorization");
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Fall back to httpOnly cookie (handles page refresh when Redux token is lost)
    if (!token || token === "null" || token === "undefined") {
      token = req.cookies.get("accessToken")?.value;
    }

    if (!token) {
      throw new Error("No token provided");
    }

    const secret = process.env.SECRET_KEY_ACCESS_TOKEN;

    if (!secret) {
      throw new Error("SECRET_KEY_ACCESS_TOKEN not defined in env");
    }

    const decoded: any = jwt.verify(token, secret);

    if (!decoded) throw new Error("Invalid token");

    // ✔ FIXED CONDITION
    if (
      decoded.role !== ACCOUNT_TYPE.ADMIN &&
      decoded.role !== ACCOUNT_TYPE.SUPERADMIN
    ) {
      throw new Error("Unauthorized: Only Admin or Super-Admin allowed");
    }

    return decoded; // success → return user info if needed
  } catch (error) {
    console.error("ensureAdmin Error:", error);
    throw new Error("Unauthorized");
  }
}

export async function getCurrentAdmin(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  let token: string | undefined;

  if (authHeader) {
    token = authHeader.split(" ")[1];
  }

  // Fall back to httpOnly cookie
  if (!token || token === "null" || token === "undefined") {
    token = req.cookies.get("accessToken")?.value;
  }

  if (!token) throw new Error("Unauthorized");

  const secret = process.env.SECRET_KEY_ACCESS_TOKEN!;
  const decoded: any = jwt.verify(token, secret);

  if (decoded.role !== "ADMIN" && decoded.role !== "SUPER-ADMIN") {
    throw new Error("Unauthorized");
  }
  return decoded.id; // Return admin_id
}

export async function ensureSuperAdmin(req: NextRequest) {
  const auth = verifyUser(req);

  if (!auth) {
    throw new Error("Unauthorized");
  }

  if (auth.role !== ACCOUNT_TYPE.SUPERADMIN) {
    throw new Error("Forbidden: Only SUPER-ADMIN allowed");
  }

  return auth;
}
