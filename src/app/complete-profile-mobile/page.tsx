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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/slices/authSlice";
import { RootState } from "@/redux/store/store";
import toast from "react-hot-toast";

export default function CompleteProfileMobilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const form = useForm({
    mode: "onChange",
    defaultValues: {
      fname: "",
      lname: "",
      email: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (!user?.id) {
        toast.error("User ID not found. Please log in again.");
        return;
      }

      const payload: any = {
        fname: data.fname,
        lname: data.lname,
      };

      if (data.email && data.email.trim() !== "") {
        payload.email = data.email;
      }

      const res = await fetch(`/api/profile/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        const updatedUser = { ...user, ...payload };
        dispatch(setUser(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser));

        toast.success("Profile updated successfully!");

        const isAdmin = ["ADMIN", "SUPER-ADMIN"].includes(updatedUser.role);
        router.push(isAdmin ? "/admin" : "/");
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <Card className="w-full max-w-lg shadow-xl border border-slate-100 bg-white">
        <CardHeader className="space-y-2 text-center">
          <p className="text-xs font-semibold tracking-[0.4em] text-slate-400 uppercase">
            Welcome to Alpha!
          </p>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Complete Your Profile
          </CardTitle>
          <p className="text-slate-500 text-sm">
            Please tell us a bit more about yourself to get started.
          </p>
        </CardHeader>
        <CardContent className="pt-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
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
                      <FormLabel className="text-sm font-medium text-slate-600">First Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="John" className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                      <FormLabel className="text-sm font-medium text-slate-600">Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Doe" className="h-11" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                rules={{
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-600">Email Address (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="you@example.com"
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 space-y-3">
                <Button
                  type="submit"
                  disabled={!form.formState.isValid || isSubmitting}
                  className="w-full h-11 text-base font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-200 disabled:text-slate-500"
                >
                  {isSubmitting ? "Saving..." : "Continue to Dashboard"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
