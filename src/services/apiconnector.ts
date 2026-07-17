import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import store from "@/redux/store/store";
import { setToken } from "@/redux/slices/authSlice";
type HTTPMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// ✅ Create axios instance with credentials (auto-send httpOnly cookies)
export const axiosInstance = axios.create({
  withCredentials: true,
});

// ─── Refresh Token Interceptor ─────────────────────────────
// When a request gets 401 (access token expired), this interceptor:
// 1. Calls /api/auth/refresh-token to get new tokens
// 2. Retries the original request automatically
// 3. Queues any other requests that failed while refreshing
// The user never notices the token expired — seamless experience.

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  config: InternalAxiosRequestConfig;
}> = [];

const processQueue = (error: any | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      resolve(axiosInstance(config));
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors and avoid infinite loops
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh if the failing request IS the refresh endpoint
    if (originalRequest.url?.includes("/api/auth/refresh-token")) {
      return Promise.reject(error);
    }

    // Don't try to refresh for login/signup requests
    if (
      originalRequest.url?.includes("/api/auth/sign-in") ||
      originalRequest.url?.includes("/api/auth/sign-up")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another refresh is already in progress — queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await axios.post(
        "/api/auth/refresh-token",
        {},
        { withCredentials: true }
      );

      if (refreshResponse.data?.success) {
        const newAccessToken = refreshResponse.data?.data?.accessToken;

        // Persist the new token for future requests
        if (newAccessToken && typeof window !== "undefined") {
          localStorage.setItem("accessToken", newAccessToken);
          store.dispatch(setToken(newAccessToken));
        }

        // Update the original request's Authorization header with the new token
        if (newAccessToken && originalRequest.headers) {
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        }

        // Refresh succeeded — retry all queued requests
        processQueue(null, newAccessToken || null);
        // Retry the original request
        return axiosInstance(originalRequest);
        // Refresh returned non-success
        processQueue(new Error("Token refresh failed"));
        const isAuthCheck = originalRequest.url?.includes("/api/auth/me");
        forceLogout(isAuthCheck);
        return Promise.reject(error);
      }
    } catch (refreshError) {
      // Refresh request itself failed
      processQueue(refreshError);
      const isAuthCheck = originalRequest.url?.includes("/api/auth/me");
      forceLogout(isAuthCheck);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

function forceLogout(skipRedirect = false) {
  // Clear client-side data
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.clear();

    // Redirect to login (only if not already on auth pages and not skipping)
    if (!skipRedirect && !window.location.pathname.startsWith("/auth/")) {
      window.location.href = "/auth/sign-in";
    }
  }
}

// ✅ Define a reusable API connector with proper TypeScript types
export const apiConnector = async <T = any>(
  method: HTTPMethod,
  url: string,
  bodyData?: any,
  headers?: Record<string, string>,
  params?: Record<string, any>
): Promise<AxiosResponse<T>> => {
  const config: AxiosRequestConfig = {
    method,
    url,
    data: bodyData || undefined,
    headers: headers || undefined,
    params: params || undefined,
  };

  return axiosInstance(config);
};
