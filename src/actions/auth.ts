"use server";

import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import UserModel from "@/lib/models/User.model";

export async function logoutAction() {
  const cookieStore = await cookies();

  // 1. Get refresh token before clearing (to invalidate in DB)
  const refreshToken = cookieStore.get("refreshToken")?.value;

  // 2. Invalidate refresh token in DB (prevents reuse of stolen tokens)
  if (refreshToken) {
    try {
      await connectDB();
      await UserModel.updateOne(
        { refresh_token: refreshToken },
        { refresh_token: "" }
      );
    } catch (err) {
      console.error("Failed to invalidate refresh token in DB:", err);
    }
  }

  // 3. Clear all auth cookies
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("user"); // Clean up legacy user cookie if it exists
}
