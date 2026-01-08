"use client";

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
import { sendOtp, signIn } from "@/services/operations/auth";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { CardContent, CardFooter } from "../ui/card";
import Image from "next/image";
import googleImg from "@/assets/images/googleImg.png";
import facebookImg from "@/assets/images/facebookImg.png";
import { useState } from "react";
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
}: {
  isSignUp: boolean;
  isSignIn: boolean;
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  const form = useForm({
    mode: "onChange", // 🔥 real-time validation
    defaultValues: {
      fname: "",
      lname: "",
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

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const finalData = {
        ...data,
        phone: selectedCountryCode + " " + data.phone,
      };
      if (isSignUp) {
        await sendOtp(finalData.email, router);
        localStorage.setItem("pendingUser", JSON.stringify(finalData));
        router.push("/verify-email");
      } else {
        await signIn(data.email, data.password, router, dispatch);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardContent className="px-4 md:px-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            {/* FIRST + LAST NAME */}
            {isSignUp && (
              <div className="flex flex-col md:flex-row gap-3">
                {/* First Name */}
                <FormField
                  control={form.control}
                  name="fname"
                  rules={{
                    required: "First Name is required",
                    minLength: { value: 3, message: "Minimum 3 characters" },
                    pattern: {
                      value: /^[A-Za-z ]+$/,
                      message: "Only alphabets are allowed",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem className="grow">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John" className="h-13" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Last Name */}
                <FormField
                  control={form.control}
                  name="lname"
                  rules={{
                    required: "Last Name is required",
                    minLength: { value: 3, message: "Minimum 3 characters" },
                    pattern: {
                      value: /^[A-Za-z ]+$/,
                      message: "Only alphabets are allowed",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem className="grow">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Doe" className="h-13" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* EMAIL FIELD */}
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
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="you@example.com"
                      className="h-13"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PHONE (SignUp Only) */}
            {isSignUp && (
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
                    <FormLabel>Mobile No.</FormLabel>

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
                        <SelectTrigger className="w-32 h-13! py-5 border-gray-400">
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
                          className="h-13 flex-1 focus-visible:ring-2 focus-visible:ring-blue-300"
                        />
                      </FormControl>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* PASSWORD */}
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
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="h-13 pr-10"
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

            {isSignIn && (
              <div className="w-full text-end">
                <button
                  onClick={() => router.push("/forgot-password")}
                  className="text-sm font-medium text-blue-500 hover:text-blue-700 cursor-pointer transition-colors"
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
                    <FormLabel>Confirm Password</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          type={showConfirm ? "text" : "password"}
                          placeholder="Re-enter password"
                          className="h-13 pr-10"
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
              className="w-full cursor-pointer disabled:cursor-no-drop bg-indigo-600 hover:bg-indigo-700 text-white h-11 disabled:opacity-40 relative"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="scale-50">
                    <PencilLoader />
                  </span>
                  <span>{isSignUp ? "Creating Account..." : "Signing In..."}</span>
                </span>
              ) : (
                <span>{isSignUp ? "Register" : "Log-In"}</span>
              )}
            </Button>
          </form>
        </Form>

        {/* Divider */}
        <div className="flex items-center gap-2 my-6">
          <Separator className="flex-1 bg-gray-300" />
          <span className="text-gray-400 text-sm">Or</span>
          <Separator className="flex-1 bg-gray-300" />
        </div>

        {/* Social Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            className="w-16 h-14 rounded-xl p-2 cursor-pointer"
            onClick={() => {
              dispatch(setLoginProvider("google"));
              nextAuthSignIn("google", { callbackUrl: "/" });
            }}
          >
            <Image src={googleImg} alt="google" />
          </Button>
          <Button
            variant="outline"
            className="w-14 h-14 rounded-xl p-3 cursor-pointer"
          >
            <Image src={facebookImg} alt="facebook" />
          </Button>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex justify-center text-sm pb-6">
        <p>
          {isSignUp ? "Already have an account?" : "Don’t have an account?"}
          <button
            onClick={() =>
              router.push(isSignUp ? "/auth/sign-in" : "/auth/sign-up")
            }
            className="text-indigo-600 font-bold cursor-pointer"
          >
            {isSignUp ? "Log-In" : "Register"}
          </button>
        </p>
      </CardFooter>
    </>
  );
}
