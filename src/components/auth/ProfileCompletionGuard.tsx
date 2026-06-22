"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { useRouter, usePathname } from "next/navigation";

export default function ProfileCompletionGuard() {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
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

    const userRole = storedUser?.role;
    const isPrivilegedRole = userRole === "ADMIN" || userRole === "SUPER-ADMIN";

    // Only enforce profile completion for regular users
    if (isPrivilegedRole || storedUser.role !== "USER") {
      setHasChecked(true);
      return;
    }

    // Check if profile is completed
    let isCompleted = storedUser.profileCompleted;
    if (!isCompleted) {
      const isDummyOTPUser = storedUser.fname === "User" && storedUser.lname === "Mobile";
      isCompleted = !!storedUser.phone && !!storedUser.fname && !!storedUser.lname && !isDummyOTPUser;
    }

    if (!isCompleted) {
      const hasPhone =
        typeof storedUser?.phone === "string"
          ? storedUser.phone.trim().length > 0
          : Boolean(storedUser?.phone);

      // Avoid infinite redirect loops if already on the right page
      if (pathname !== "/complete-profile" && pathname !== "/complete-profile-mobile") {
        if (!hasPhone) {
          // Google user missing phone
          router.push("/complete-profile");
        } else {
          // Mobile OTP user missing name/email
          router.push("/complete-profile-mobile");
        }
      }
    } else {
      // Profile is completed. If they are on an onboarding page, redirect them away
      if (pathname === "/complete-profile" || pathname === "/complete-profile-mobile") {
        router.push("/");
      } else {
        setHasChecked(true);
      }
    }
  }, [user, isAuthenticated, pathname, router, hasChecked]);

  return null;
}
