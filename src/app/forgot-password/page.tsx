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
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { sendOtp } from "@/services/operations/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const form = useForm({
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: any) => {
    localStorage.setItem("resetEmail", data.email); // ⭐ store email for OTP page

    await sendOtp(data.email, router);
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

        {/* TITLE */}
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
          <p className="text-gray-500 text-sm mt-1 px-4">
            Forgot your password? Don’t worry. Just enter your email below.
          </p>
        </div>

        {/* FORM */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 mt-6"
          >
            {/* EMAIL INPUT */}
            <FormField
              control={form.control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="you@example.com"
                      className="h-12 bg-gray-100"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SEND BUTTON */}
            <Button
              type="submit"
              disabled={!form.formState.isValid}
              className="w-full h-12 text-white cursor-pointer bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-40"
            >
              Send Code
            </Button>
          </form>
        </Form>

        {/* FOOTER */}
        <p className="text-center text-gray-600 text-sm mt-10">
          Go Back To{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-indigo-600 font-semibold cursor-pointer"
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}
