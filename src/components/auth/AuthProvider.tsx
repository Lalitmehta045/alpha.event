"use client";

import { useEffect, useState } from "react";
import { signOut, useSession, getSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUser, setLoginProvider } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store/store";
import { apiConnector } from "@/services/apiconnector";
import { endpoints } from "@/services/api_endpoints";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const [isChecking, setIsChecking] = useState(true);
  const { status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    const checkAuth = async () => {
      const session = await getSession();
      const loginProvider = typeof window !== "undefined"
        ? localStorage.getItem("loginProvider")
        : null;

      if (session?.user && loginProvider === "google") {
        // Legitimate Google session — let GoogleAuthHandler handle it.
        // Only skip /api/auth/me when we KNOW this is a Google login,
        // not a stale session lingering after credentials/OTP logout.
        setIsChecking(false);
        return;
      }

      // For all other cases (credentials, OTP, post-logout):
      // proceed to /api/auth/me check normally.
      // If /api/auth/me fails with 401, it will call signOut() which
      // clears the stale Google NextAuth session properly.

      try {
        // Explicitly check the me endpoint on startup
        const res = await apiConnector("GET", "/api/auth/me");

        if (res?.data?.success === true) {
          const { user, token } = res.data.data;

          // Hydrate Redux with authoritative data from the server
          dispatch(setUser(user));
          if (token) {
            dispatch(setToken(token));
          }
          // Restore loginProvider in Redux from localStorage
          const storedProvider = typeof window !== "undefined"
            ? localStorage.getItem("loginProvider") as "credentials" | "google" | null
            : null;
          if (storedProvider) {
            dispatch(setLoginProvider(storedProvider));
          }
        } else {
          const error = new Error("Unauthorized") as Error & { status?: number };
          error.status = res?.status;
          throw error;
        }
      } catch (error: any) {
        const responseStatus = error?.response?.status ?? error?.status;

        if (responseStatus === 401) {
          dispatch(setUser(null));
          dispatch(setToken(null));

          if (typeof window !== "undefined") {
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("loginProvider");
          }

          await signOut({ redirect: false });
        } else {
          console.warn(
            "AuthProvider: could not reach /api/auth/me, preserving existing state"
          );
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [dispatch, status]);

  // Show a full screen loader to prevent auth flicker during initial load
  if (isChecking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
