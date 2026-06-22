"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useDispatch, useSelector } from "react-redux";
import { setToken, setUser } from "@/redux/slices/authSlice";
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
        } else {
          const error = new Error("Unauthorized") as Error & { status?: number };
          error.status = res?.status;
          throw error;
        }
      } catch (error: any) {
        const responseStatus = error?.response?.status ?? error?.status;

        if (responseStatus === 401) {
          const isMinting =
            typeof window !== "undefined" &&
            sessionStorage.getItem("google_token_minting") === "true";

          if (isMinting || status === "authenticated") {
            console.warn("AuthProvider: NextAuth session active or minting in progress, skipping state clear.");
            return;
          }

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
