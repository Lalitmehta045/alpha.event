// /lib/vendorGuard.ts
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { ACCOUNT_TYPE } from "@/utils/constant";

export async function ensureVendor(req: NextRequest) {
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

    // Allow VENDOR, ADMIN, and SUPER-ADMIN
    if (
      decoded.role !== ACCOUNT_TYPE.VENDOR &&
      decoded.role !== ACCOUNT_TYPE.ADMIN &&
      decoded.role !== ACCOUNT_TYPE.SUPERADMIN
    ) {
      throw new Error("Unauthorized: Only Vendor, Admin or Super-Admin allowed");
    }

    return decoded; // success → return user info if needed
  } catch (error) {
    throw new Error("Unauthorized");
  }
}

export async function getCurrentVendor(req: NextRequest): Promise<string> {
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

  try {
    const secret = process.env.SECRET_KEY_ACCESS_TOKEN!;
    const decoded: any = jwt.verify(token, secret);

    if (
      decoded.role !== ACCOUNT_TYPE.VENDOR &&
      decoded.role !== ACCOUNT_TYPE.ADMIN &&
      decoded.role !== ACCOUNT_TYPE.SUPERADMIN
    ) {
      throw new Error("Unauthorized");
    }

    return decoded.id; // Return vendorId for filtering products
  } catch (error) {
    throw new Error("Unauthorized");
  }
}
