"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Explicitly check the me endpoint on startup
        const res = await apiConnector("GET", "/api/auth/me");
        
        if (res?.data?.success) {
          const { user, token } = res.data.data;
          
          // Hydrate Redux with authoritative data from the server
          dispatch(setUser(user));
          if (token) {
            dispatch(setToken(token));
          }
        } else {
          throw new Error("Unauthorized");
        }
      } catch (error) {
        // If unauthenticated (e.g., cookies missing or expired)
        // Ensure Redux and localStorage are completely clear
        dispatch(setUser(null));
        dispatch(setToken(null));
        
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("loginProvider");
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [dispatch]);

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
