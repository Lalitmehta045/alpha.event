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
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { resetPasswordService } from "@/services/operations/auth";
import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface ResetFormType {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  // store localStorage values
  const [storeEmail, setStoreEmail] = useState<string | null>(null);
  const [storeOTP, setStoreOTP] = useState<string | null>(null);

  const form = useForm<ResetFormType>({
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Load OTP + Email from localStorage
  useEffect(() => {
    const storedOTP = localStorage.getItem("otpReset");
    const storedEmail = localStorage.getItem("resetEmail");

    if (storedOTP && storedEmail) {
      setStoreOTP(storedOTP);
      setStoreEmail(storedEmail);
    } else {
      toast.error("OTP expired. Please request again.");
      router.push("/forgot-password");
    }
  }, [router]);

  const onSubmit = async (data: ResetFormType) => {
    if (!storeEmail || !storeOTP) {
      toast.error("Session expired. Try again.");
      router.push("/forgot-password");
      return;
    }

    setLoading(true);

    const result = await resetPasswordService(
      storeEmail,
      data.password,
      data.confirmPassword,
      parseInt(storeOTP),
      router
    );

    setLoading(false);

    if (!result) return;

    // Clear localStorage only if success
    localStorage.removeItem("resetEmail");
    localStorage.removeItem("otpReset");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl px-6 py-8 relative">
        {/* BACK BUTTON */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition"
        >
          <ArrowLeft size={22} />
        </button>

        {/* HEADER */}
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-gray-500 text-sm mt-1 px-4">
            To reset your password, please enter a new password and confirm it.
          </p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 mt-6 flex flex-col gap-2"
          >
            {/* PASSWORD FIELD */}
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
                  <FormLabel>New Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        className="h-13 pr-10"
                      />
                    </FormControl>

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

            {/* CONFIRM PASSWORD FIELD */}
            <FormField
              control={form.control}
              name="confirmPassword"
              rules={{
                required: "Confirm password is required",
                validate: (value) =>
                  value === form.getValues("password") ||
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

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              disabled={!form.formState.isValid || loading}
              className="w-full h-12 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-40"
            >
              {loading ? "Processing..." : "Reset Password"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
