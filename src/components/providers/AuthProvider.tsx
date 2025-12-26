"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { refreshTheToken } = useTokenRefresh();

  useEffect(() => {
    // Initialize auth state from storage on app load
    const initializeAuth = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        const user = localStorage.getItem("user");

        if (token && refreshToken && user) {
          try {
            const parsedUser = JSON.parse(user);
            const { setToken, setRefreshToken, setUser } = require("@/redux/slices/authSlice");
            
            dispatch(setToken(token));
            dispatch(setRefreshToken(refreshToken));
            dispatch(setUser(parsedUser));
          } catch (error) {
            console.error("Failed to parse user data:", error);
          }
        }
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Token refresh logic is handled by useTokenRefresh hook
  useEffect(() => {
    // Set up periodic token refresh check
    const interval = setInterval(() => {
      refreshTheToken();
    }, 10 * 60 * 1000); // Check every 10 minutes

    return () => clearInterval(interval);
  }, [refreshTheToken]);

  return <>{children}</>;
};
