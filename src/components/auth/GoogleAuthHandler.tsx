"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUser } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store/store";

export default function GoogleAuthHandler() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const reduxToken = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const generateTokenForGoogleUser = async () => {
      // Only run if:
      // 1. Session exists (user is logged in with Google)
      // 2. No token in Redux yet
      // 3. Session is ready (not loading)
      if (session?.user && !reduxToken && status === "authenticated") {
        try {
          const res = await fetch("/api/auth/google-token", {
            method: "POST",
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              dispatch(setToken(data.data.accessToken));
              dispatch(setUser(data.data.user));
              localStorage.setItem("accessToken", data.data.accessToken);
              localStorage.setItem("refreshToken", data.data.refreshToken);
              localStorage.setItem("user", JSON.stringify(data.data.user));
            }
          }
        } catch (error) {
          console.error("Failed to generate token for Google user:", error);
        }
      }
    };

    generateTokenForGoogleUser();
  }, [session, status, reduxToken, dispatch]);

  return null;
}
