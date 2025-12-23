// /lib/adminGuard.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { ACCOUNT_TYPE } from "@/utils/constant";
import { verifyUser } from "./verifyUser";

export async function ensureAdmin(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }

    const token = authHeader.split(" ")[1];
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
  if (!authHeader) throw new Error("Unauthorized");

  const token = authHeader.split(" ")[1];
  const secret = process.env.SECRET_KEY_ACCESS_TOKEN!;
  const decoded: any = jwt.verify(token, secret);

  if (decoded.role !== "ADMIN") throw new Error("Unauthorized");
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
