"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUser } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store/store";
import { hasGuestCart, getGuestCartForSync } from "@/utils/guestCart";
import { syncCartAfterLogin, getAllCartItems } from "@/services/operations/cartItem";
import { handleAddItemCart } from "@/redux/slices/cartSlice";

export default function GoogleAuthHandler() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const reduxUser = useSelector((state: RootState) => state.auth.user);
  const fetchedRef = useRef(false);

  useEffect(() => {
    const generateTokenForGoogleUser = async () => {
      // Only run if:
      // 1. Session exists (user is logged in with Google)
      // 2. No user in Redux yet
      // 3. Session is ready (not loading)
      // 4. We haven't fetched it yet (prevent StrictMode double-fetch)
      if (session?.user && !reduxUser && status === "authenticated" && !fetchedRef.current) {
        fetchedRef.current = true;
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
              localStorage.setItem("loginProvider", "google");

              // ✅ Sync guest cart to server after Google login
              if (hasGuestCart()) {
                const guestItems = getGuestCartForSync();
                await syncCartAfterLogin(guestItems, dispatch, data.data.accessToken);
              } else {
                // No guest cart, load server cart
                const serverCart = await getAllCartItems(data.data.accessToken);
                dispatch(handleAddItemCart(serverCart));
              }

              // ✅ Redirect to callbackUrl if present
              if (typeof window !== "undefined") {
                const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
                if (callbackUrl) {
                  window.location.href = callbackUrl;
                }
              }
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
