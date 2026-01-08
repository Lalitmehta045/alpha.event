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

    const storedLoginProvider =
      loginProvider ||
      (typeof window !== "undefined"
        ? (localStorage.getItem("loginProvider") as
            | "google"
            | "credentials"
            | null)
        : null);

    if (storedLoginProvider !== "google") {
      setHasChecked(true);
      return;
    }

    const storedUser =
      user ||
      (typeof window !== "undefined"
        ? JSON.parse(localStorage.getItem("user") || "null")
        : null);

    const hasPhone = Boolean(storedUser?.phone);

    if (!hasPhone && pathname !== "/complete-profile") {
      router.push("/complete-profile");
    } else {
      setHasChecked(true);
    }
  }, [user, isAuthenticated, pathname, router, loginProvider, hasChecked]);

  return null;
}
