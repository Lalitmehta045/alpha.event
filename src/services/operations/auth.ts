"use client";

import { toast } from "react-hot-toast";
import { endpoints } from "../api_endpoints";
import { apiConnector } from "../apiconnector";
import { setToken, setUser } from "@/redux/slices/authSlice";
import { logoutAction } from "@/actions/auth";

const { SENDOTPEMAIL_API, SIGNUP_API, SIGNIN_API, RESETPASSWORD_API } =
  endpoints;

// ✅ SEND OTP
export async function sendOtp(email: string, router: any) {
  const toastId = toast.loading("Sending OTP...");

  try {
    const response = await apiConnector("POST", SENDOTPEMAIL_API, {
      email,
      checkUserPresent: true,
    });

    // ✅ Check correct structure
    if (!response?.data) {
      toast.dismiss(toastId);
      toast.error(response.data?.error || "OTP sending failed");
      return null;
    }

    toast.success("OTP sent successfully ✅");

    router.push("/verify-email"); // ✅ Move to next screen
    return response.data;
  } catch (err: any) {
    toast.error(
      err.response?.data?.error || err.message || "Failed to send OTP"
    );
    return null;
  } finally {
    toast.dismiss(toastId);
  }
}

// ✅ SIGN UP
export async function signUp(
  fname: string,
  lname: string,
  email: string,
  phone: number,
  password: string,
  confirmPassword: string,
  otp: number,
  router: any
) {
  const toastId = toast.loading("Creating your account...");

  try {
    const response = await apiConnector("POST", SIGNUP_API, {
      fname,
      lname,
      email,
      phone,
      password,
      confirmPassword,
      otp,
    });

    // ✅ Backend failed
    if (!response.data.success) {
      toast.dismiss(toastId);
      toast.error("Registration failed");
      console.log("Registration Error: ", response.data.error);
      return;
    }

    // ✅ Success
    toast.dismiss(toastId);
    toast.success("Signup successfull ✅");

    router.push("/auth/sign-in");
  } catch (err: any) {
    toast.dismiss(toastId);
    toast.error(err.response?.data?.message || "Signup failed");
  }
}

// ✅ SIGN IN====In your signIn function
export async function signIn(
  email: string,
  password: string,
  router: any,
  dispatch: any
) {
  const toastId = toast.loading("Signing in...");

  try {
    const response = await apiConnector("POST", SIGNIN_API, {
      email,
      password,
    });

    if (!response?.data?.data) {
      toast.dismiss(toastId);
      toast.error("Signin failed");
      return null;
    }

    const { accessToken, refreshToken, user } = response.data.data;

    // Store Tokens & User
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    sessionStorage.setItem("accessToken", accessToken);
    sessionStorage.setItem("refreshToken", refreshToken);
    sessionStorage.setItem("user", JSON.stringify(user));

    // ⬇️ DISPATCH FIRST (VERY IMPORTANT)
    dispatch(setToken(accessToken));
    dispatch(setUser(user));

    toast.dismiss(toastId);
    toast.success("Login successfull ✅");

    // ⬇️ NOW DO REDIRECT AFTER DISPATCH
    const isAdmin = ["ADMIN", "SUPER-ADMIN"].includes(user.role);

    router.push(isAdmin ? "/admin" : "/");

    return response.data;
  } catch (err: any) {
    toast.dismiss(toastId);
    toast.error(err.message || "Login failed");
    return null;
  }
}

export async function logout(router: any, dispatch: any) {
  try {
    toast.loading("Logging out...");

    // 1. Clear Server-Side Cookies (Crucial)
    await logoutAction();

    // 2. Clear Client-Side Storage
    sessionStorage.clear(); // Clears everything in session
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // 3. Reset Redux
    dispatch(setUser(null));

    toast.dismiss();
    toast.success("Logged out successfully!");

    // 4. Force strict navigation
    // router.refresh() clears the Next.js client router cache
    router.refresh();
    router.replace("/auth/sign-in");
  } catch (err) {
    toast.dismiss();
    toast.error("Logout failed");
    console.error("Logout Error:", err);
  }
}

export async function resetPasswordService(
  email: string,
  newPassword: string,
  confirmPassword: string,
  otp: Number,
  router: any
) {
  const toastId = toast.loading("Updating password...");

  try {
    const response = await apiConnector("POST", RESETPASSWORD_API, {
      email,
      newPassword,
      confirmPassword,
      otp,
    });

    // Backend error
    if (!response?.data?.success) {
      toast.dismiss(toastId);
      toast.error("Password reset failed");
      console.log("Reset Password error: ", response.data.message);
      return null;
    }

    toast.dismiss(toastId);
    toast.success("Password updated successfully 🎉");

    // Redirect to login
    router.push("/auth/sign-in");

    return response.data;
  } catch (err: any) {
    toast.dismiss(toastId);
    toast.error("Password reset failed");
    console.log("Reset Password error: ", err?.response?.data?.message);
    return null;
  }
}
