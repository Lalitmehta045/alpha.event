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
  const toastId = toast.loading("📧 Sending verification code...");

  try {
    const response = await apiConnector("POST", SENDOTPEMAIL_API, {
      email,
      checkUserPresent: true,
    });

    if (!response?.data) {
      toast.dismiss(toastId);
      toast.error(response.data?.error || "Unable to send verification code. Please try again.");
      return null;
    }

    toast.success("✅ Verification code sent successfully! Check your email.");

    router.push("/verify-email");
    return response.data;
  } catch (err: any) {
    toast.error(
      err.response?.data?.error || err.message || "Failed to send verification code. Please try again."
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
  const toastId = toast.loading("🔐 Creating your account...");

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

    if (!response.data.success) {
      toast.dismiss(toastId);
      toast.error("Registration failed. Please check your details and try again.");
      console.log("Registration Error: ", response.data.error);
      return;
    }

    toast.dismiss(toastId);
    toast.success("🎉 Account created successfully! Please sign in to continue.");

    router.push("/auth/sign-in");
  } catch (err: any) {
    toast.dismiss(toastId);
    toast.error(err.response?.data?.message || "Registration failed. Please try again.");
  }
}

// ✅ SIGN IN====In your signIn function
export async function signIn(
  email: string,
  password: string,
  router: any,
  dispatch: any
) {
  const toastId = toast.loading("🔐 Signing you in...");

  try {
    const response = await apiConnector("POST", SIGNIN_API, {
      email,
      password,
    });

    if (!response?.data?.data) {
      toast.dismiss(toastId);
      toast.error("Invalid credentials. Please check your email and password.");
      return null;
    }

    const { accessToken, refreshToken, user } = response.data.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    sessionStorage.setItem("accessToken", accessToken);
    sessionStorage.setItem("refreshToken", refreshToken);
    sessionStorage.setItem("user", JSON.stringify(user));

    dispatch(setToken(accessToken));
    dispatch(setUser(user));

    toast.dismiss(toastId);
    toast.success(`🎉 Welcome back, ${user.fname}!`);

    const isAdmin = ["ADMIN", "SUPER-ADMIN"].includes(user.role);
    router.push(isAdmin ? "/admin" : "/");

    return response.data;
  } catch (err: any) {
    toast.dismiss(toastId);
    toast.error(err.message || "Login failed. Please try again.");
    return null;
  }
}

export async function logout(router: any, dispatch: any) {
  const toastId = toast.loading("👋 Logging you out...");

  try {
    await logoutAction();

    sessionStorage.clear();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    dispatch(setUser(null));

    toast.dismiss(toastId);
    toast.success("Logged out successfully. See you soon!");

    router.refresh();
    router.replace("/auth/sign-in");
  } catch (err) {
    toast.dismiss(toastId);
    toast.error("Unable to logout. Please try again.");
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
  const toastId = toast.loading("🔒 Updating your password...");

  try {
    const response = await apiConnector("POST", RESETPASSWORD_API, {
      email,
      newPassword,
      confirmPassword,
      otp,
    });

    if (!response?.data?.success) {
      toast.dismiss(toastId);
      toast.error("Password reset failed. Please try again.");
      console.log("Reset Password error: ", response.data.message);
      return null;
    }

    toast.dismiss(toastId);
    toast.success("🎉 Password updated successfully! You can now sign in with your new password.");

    router.push("/auth/sign-in");

    return response.data;
  } catch (err: any) {
    toast.dismiss(toastId);
    toast.error("Password reset failed. Please try again.");
    console.log("Reset Password error: ", err?.response?.data?.message);
    return null;
  }
}
