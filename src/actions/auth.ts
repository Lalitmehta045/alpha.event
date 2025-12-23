"use server";

import { cookies } from "next/headers";

export async function logoutAction() {
  // 1. Await the cookie store first
  const cookieStore = await cookies();

  // 2. Now you can delete them
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("user");
}
