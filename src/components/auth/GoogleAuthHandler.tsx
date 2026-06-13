"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUser } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store/store";

export default function GoogleAuthHandler() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const reduxUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const generateTokenForGoogleUser = async () => {
      // Only run if:
      // 1. Session exists (user is logged in with Google)
      // 2. No user in Redux yet
      // 3. Session is ready (not loading)
      if (session?.user && !reduxUser && status === "authenticated") {
        try {
          const res = await fetch("/api/auth/google-token", {
            method: "POST",
            credentials: "include", // Send cookies
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              // ✅ Tokens are now in httpOnly cookies (set by server)
              // Store token in Redux for service files using Authorization header
              dispatch(setToken(data.data.accessToken));
              dispatch(setUser(data.data.user));
              localStorage.setItem("user", JSON.stringify(data.data.user));
            }
          }
        } catch (error) {
          console.error("Failed to generate token for Google user:", error);
        }
      }
    };

    generateTokenForGoogleUser();
  }, [session, status, reduxUser, dispatch]);

  return null;
}
