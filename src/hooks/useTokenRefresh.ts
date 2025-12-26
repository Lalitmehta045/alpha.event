"use client";

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { setToken } from "@/redux/slices/authSlice";
import { refreshAccessToken } from "@/lib/token/refreshAccessToken";

export const useTokenRefresh = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);

  const refreshTheToken = useCallback(async () => {
    if (!refreshToken) return;

    try {
      const newAccessToken = await refreshAccessToken(refreshToken);
      if (newAccessToken) {
        dispatch(setToken(newAccessToken));
        localStorage.setItem("accessToken", newAccessToken);
        sessionStorage.setItem("accessToken", newAccessToken);
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Optionally logout user on refresh failure
    }
  }, [refreshToken, dispatch]);

  useEffect(() => {
    if (!token || !refreshToken) return;

    // Check token expiration every 5 minutes
    const checkTokenExpiry = () => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        const timeUntilExpiry = payload.exp - currentTime;

        // If token expires in less than 10 minutes, refresh it
        if (timeUntilExpiry < 600) {
          refreshTheToken();
        }
      } catch (error) {
        console.error("Token parsing error:", error);
      }
    };

    // Check immediately
    checkTokenExpiry();

    // Set up interval to check periodically
    const interval = setInterval(checkTokenExpiry, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [token, refreshToken, refreshTheToken]);

  return { refreshTheToken };
};
