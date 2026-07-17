"use client";

import Script from "next/script";

import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { sendOtp, signIn, msg91SignIn } from "@/services/operations/auth";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiSmartphone, FiMail } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { CardContent, CardFooter } from "../ui/card";
import Image from "next/image";
import googleImg from "@/assets/images/googleImg.png";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import PencilLoader from "../common/PencilLoader";
import countryCode from "@/assets/data/countryCode.json";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { setLoginProvider } from "@/redux/slices/authSlice";

export default function AuthForm({
  isSignUp,
  isSignIn,
  isVendor,
}: {
  isSignUp: boolean;
  isSignIn: boolean;
  isVendor?: boolean;
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  const form = useForm({
    mode: "onChange", // 🔥 real-time validation
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Find default Indian country
  const defaultCountry = countryCode.find((c) => c.flag === "🇮🇳");

  const defaultSelectValue = defaultCountry
    ? `${defaultCountry.code}-${defaultCountry.id}`
    : "";

  const [selectedCountryCode, setSelectedCountryCode] = useState(
    defaultCountry?.code || "+91"
  );

  const [selectValue, setSelectValue] = useState(defaultSelectValue);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");

  const handleMsg91LoginToggle = () => {
    setLoginMethod(prev => prev === "email" ? "phone" : "email");
    // Clear form errors when switching
    form.clearErrors();
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    let keepLoading = false;
    try {
      const nameParts = (data.fullName || "").trim().split(" ");
      const fname = nameParts[0] || "";
      const lname = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      const finalData = {
        ...data,
        fname,
        lname: lname || "User",
        phone: selectedCountryCode + " " + data.phone,
        role: isVendor ? "VENDOR" : "USER",
      };

      if (isSignUp) {
        await sendOtp(finalData.email, router);
        localStorage.setItem("pendingUser", JSON.stringify(finalData));
        router.push("/verify-email");
      } else {
        if (loginMethod === "phone") {
          keepLoading = true;
          // Initialize MSG91 widget with the entered phone number
          const config = {
            widgetId: process.env.NEXT_PUBLIC_MSG91_WIDGET_ID,
            tokenAuth: process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH,
            identifier: finalData.phone,
            success: async (responseData: any) => {
              console.log("success response", responseData);
              toast.success("OTP Verified Successfully!");
              // Send the known mobile number to the backend
              await msg91SignIn({ ...responseData, mobile: finalData.phone }, router, dispatch);
              setIsLoading(false);
            },
            failure: (error: any) => {
              console.log("failure reason", error);
              toast.error(error?.message || "OTP verification failed");
              setIsLoading(false);
            },
          };

          if (typeof window !== "undefined" && (window as any).initSendOTP) {
            (window as any).initSendOTP(config);
          } else {
            const urls = [
              "https://verify.msg91.com/otp-provider.js",
              "https://verify.phone91.com/otp-provider.js",
            ];
            let i = 0;
            const attempt = () => {
              const s = document.createElement("script");
              s.src = urls[i];
              s.async = true;
              s.onload = () => {
                if (typeof (window as any).initSendOTP === "function") {
                  (window as any).initSendOTP(config);
                }
              };
              s.onerror = () => {
                i++;
                if (i < urls.length) {
                  attempt();
                } else {
                  setIsLoading(false);
                  toast.error("Failed to load OTP service.");
                }
              };
              document.head.appendChild(s);
            };
            attempt();
          }
        } else {
          await signIn(data.email, data.password, router, dispatch);
        }
      }
    } finally {
      if (!keepLoading) {
        setIsLoading(false);
      }
    }
  };

  const inputClass = isVendor
    ? "h-13 focus-visible:ring-amber-500"
    : "h-13";
  const labelClass = "";

  return (
    <>
      <Script src="https://verify.msg91.com/otp-provider.js" strategy="afterInteractive" />
      <CardContent className="px-4 md:px-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            {/* FULL NAME */}
            {isSignUp && (
              <FormField
                control={form.control}
                name="fullName"
                rules={{
                  required: isVendor ? "Firm Name is required" : "Full Name is required",
                  minLength: { value: 3, message: "Minimum 3 characters" },
                  pattern: {
                    value: /^[A-Za-z ]+$/,
                    message: "Only alphabets are allowed",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>{isVendor ? "Firm Name" : "Full Name"}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={isVendor ? "XyzEvents" : "John Doe"} className={inputClass} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* EMAIL FIELD */}
            {(isSignUp || loginMethod === "email") && (
              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="you@example.com"
                        className={inputClass}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* PHONE (SignUp Only or Mobile Login) */}
            {(isSignUp || loginMethod === "phone") && (
              <FormField
                control={form.control}
                name="phone"
                rules={{
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Phone number must be exactly 10 digits",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Mobile No.</FormLabel>

                    {/* Flex row for Country Code + Phone Input */}
                    <div className="flex gap-3">
                      {/* COUNTRY CODE SELECT */}
                      <Select
                        value={selectValue}
                        onValueChange={(val) => {
                          setSelectValue(val);
                          setSelectedCountryCode(val.split("-")[0]); // store only "+91"
                        }}
                      >
                        <SelectTrigger className={`w-32 h-13! py-5 border-gray-400 ${isVendor ? "focus:ring-amber-500" : ""}`}>
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>

                        <SelectContent>
                          {countryCode.map((item) => (
                            <SelectItem
                              key={item.id}
                              value={`${item.code}-${item.id}`}
                            >
                              <span className="mr-2">{item.flag}</span>
                              {item.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* PHONE INPUT */}
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          maxLength={10}
                          placeholder="1234567890"
                          className={`${inputClass} flex-1`}
                        />
                      </FormControl>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* PASSWORD */}
            {(isSignUp || loginMethod === "email") && (
              <FormField
                control={form.control}
                name="password"
                rules={{
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
                    message: "Password must contain letters & numbers",
                  },
                }}
                render={({ field }) => (
                  <FormItem className="mb-1">
                    <FormLabel className={labelClass}>Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className={`${inputClass} pr-10`}
                        />
                      </FormControl>
  
                      {/* Eye Button */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {isSignIn && loginMethod === "email" && (
              <div className="w-full text-end">
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className={`text-sm font-medium ${isVendor ? "text-amber-600 hover:text-amber-700" : "text-blue-500 hover:text-blue-700"} cursor-pointer transition-colors`}
                >
                  Forget Password?
                </button>
              </div>
            )}

            {/* CONFIRM PASSWORD */}
            {isSignUp && (
              <FormField
                control={form.control}
                name="confirmPassword"
                rules={{
                  required: "Confirm Password is required",
                  validate: (val) =>
                    val === form.getValues("password") ||
                    "Passwords do not match",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>Confirm Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          type={showConfirm ? "text" : "password"}
                          placeholder="Re-enter password"
                          className={`${inputClass} pr-10`}
                        />
                      </FormControl>

                      {/* Eye Button */}
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showConfirm ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              disabled={!form.formState.isValid || isLoading}
              className={`w-full cursor-pointer disabled:cursor-no-drop h-11 disabled:opacity-40 relative ${
                isVendor
                  ? "bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/25"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="scale-50">
                    <PencilLoader />
                  </span>
                  <span>
                    {isSignUp 
                      ? "Creating Account..." 
                      : loginMethod === "phone" 
                        ? "Sending OTP..." 
                        : "Signing In..."}
                  </span>
                </span>
              ) : (
                <span>
                  {isSignUp 
                    ? "Create Account" 
                    : loginMethod === "phone" 
                      ? "Send OTP" 
                      : "Log-In"}
                </span>
              )}
            </Button>
          </form>
        </Form>

        {/* Mobile/Email Toggle Button (Hidden for Vendors to prevent incorrect role assignment) */}
        {!isVendor && (
          <Button
            type="button"
            variant="outline"
            className="w-full mt-4 flex items-center justify-center gap-2 h-11 border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer"
            onClick={handleMsg91LoginToggle}
          >
            {loginMethod === "email" ? (
              <>
                <FiSmartphone size={18} />
                <span className="font-medium">Login with Mobile Number</span>
              </>
            ) : (
              <>
                <FiMail size={18} />
                <span className="font-medium">Login with Email</span>
              </>
            )}
          </Button>
        )}

        {/* Divider (Hidden for Vendors) */}
        {!isVendor && (
          <div className="flex items-center gap-2 my-6">
            <Separator className="flex-1 bg-gray-300" />
            <span className="text-gray-400 text-sm">Or</span>
            <Separator className="flex-1 bg-gray-300" />
          </div>
        )}

        {/* Social Buttons (Hidden for Vendors) */}
        {!isVendor && (
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              type="button"
              className="w-16 h-14 rounded-xl p-2 cursor-pointer"
              onClick={() => {
                dispatch(setLoginProvider("google"));
                nextAuthSignIn("google", { 
                  callbackUrl: `/api/auth/google-sync?callbackUrl=${encodeURIComponent("/")}` 
                });
              }}
            >
              <Image src={googleImg} alt="google" />
            </Button>
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex flex-col items-center gap-4 text-sm pb-6">
        <p className="">
          {isSignUp ? "Already have an account?" : "Don’t have an account?"}
          <button
            onClick={() => {
              if (isVendor) {
                router.push(isSignUp ? "/auth/vendor-login" : "/auth/vendor-register");
              } else {
                router.push(isSignUp ? "/auth/sign-in" : "/auth/sign-up");
              }
            }}
            className={`font-bold cursor-pointer ml-1 ${isVendor ? "text-amber-600 hover:text-amber-500" : "text-indigo-600"}`}
          >
            {isSignUp ? "Log-In" : "Create Account"}
          </button>
        </p>

        {/* Separator for Vendor/User Switch */}
        <div className="w-full h-px bg-border/40 my-1" />

        <p className={isVendor ? "text-gray-400" : "text-gray-500"}>
          {isVendor ? "Not a vendor?" : "Are you a vendor?"}
          <button
            onClick={() => {
              if (isVendor) {
                router.push(isSignUp ? "/auth/sign-up" : "/auth/sign-in");
              } else {
                router.push(isSignUp ? "/auth/vendor-register" : "/auth/vendor-login");
              }
            }}
            className={`font-bold cursor-pointer ml-1 transition-colors ${
              isVendor ? "text-indigo-400 hover:text-indigo-300" : "text-amber-600 hover:text-amber-500"
            }`}
          >
            {isVendor 
              ? (isSignUp ? "Sign Up as Customer" : "Login as Customer") 
              : (isSignUp ? "Register as Vendor" : "Login as Vendor")}
          </button>
        </p>
      </CardFooter>
    </>
  );
}
