"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { useRouter, usePathname } from "next/navigation";

export default function PhoneNumberCheck() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const loginProvider = useSelector(
    (state: RootState) => state.auth.loginProvider
  );
  const router = useRouter();
  const pathname = usePathname();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (hasChecked || !isAuthenticated) return;

    const storedUser =
      user ||
      (typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null")
        : null);

    if (!storedUser) {
      setHasChecked(true);
      return;
    }

    const hasPhone =
      typeof storedUser?.phone === "string"
        ? storedUser.phone.trim().length > 0
        : Boolean(storedUser?.phone);

    const userRole = storedUser?.role;
    const isPrivilegedRole =
      userRole === "ADMIN" || userRole === "SUPER-ADMIN";

    // Only require phone for regular end users
    if (isPrivilegedRole || storedUser.role !== "USER" || hasPhone) {
      setHasChecked(true);
      return;
    }

    const storedLoginProvider =
      loginProvider ||
      (typeof window !== "undefined"
        ? (localStorage.getItem("loginProvider") as
            | "google"
            | "credentials"
            | null)
        : null);

    const isGoogleUser =
      storedLoginProvider === "google" ||
      (storedUser?.loginProvider === "google");

    if (!isGoogleUser) {
      setHasChecked(true);
      return;
    }

    if (pathname !== "/complete-profile") {
      router.push("/complete-profile");
    } else {
      setHasChecked(true);
    }
  }, [
    user,
    isAuthenticated,
    pathname,
    router,
    loginProvider,
    hasChecked,
  ]);

  return null;
}
