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
import countryCode from "@/assets/data/countryCode.json";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";

export default function CompleteProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const form = useForm({
    mode: "onChange",
    defaultValues: {
      phone: "",
    },
  });

  const defaultCountry = countryCode.find((c) => c.flag === "🇮🇳");
  const defaultSelectValue = defaultCountry
    ? `${defaultCountry.code}-${defaultCountry.id}`
    : "";

  const [selectedCountryCode, setSelectedCountryCode] = useState(
    defaultCountry?.code || "+91"
  );
  const [selectValue, setSelectValue] = useState(defaultSelectValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const fullPhone = selectedCountryCode + " " + data.phone;

      const res = await fetch("/api/save-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        const updatedUser = { ...user, phone: fullPhone };
        dispatch(setUser(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        toast.success("Phone number saved successfully!");
        router.push("/");
      } else {
        toast.error(result.error || "Failed to save phone number");
      }
    } catch (error) {
      console.error("Error saving phone:", error);
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
            Step 2 of 2
          </p>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Complete Your Profile
          </CardTitle>
          <p className="text-slate-500 text-sm">
            Add your phone number to verify your account and receive security notifications.
          </p>
        </CardHeader>
        <CardContent className="pt-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <FormLabel className="text-sm font-medium text-slate-600">
                      Mobile Number
                    </FormLabel>

                    <div className="flex gap-3 rounded-xl border border-slate-200 p-2 bg-slate-50 focus-within:border-indigo-400 focus-within:bg-white transition-colors">
                      <Select
                        value={selectValue}
                        onValueChange={(val) => {
                          setSelectValue(val);
                          setSelectedCountryCode(val.split("-")[0]);
                        }}
                      >
                        <SelectTrigger className="w-28 h-11 border-none focus:ring-0 text-sm font-medium text-slate-700">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>

                        <SelectContent className="max-h-64">
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

                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          maxLength={10}
                          placeholder="1234567890"
                          className="h-11 flex-1 border-none bg-transparent text-base tracking-wide placeholder:text-slate-400 focus-visible:ring-0 focus-visible:outline-none"
                        />
                      </FormControl>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={!form.formState.isValid || isSubmitting}
                  className="w-full h-11 text-base font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-200 disabled:text-slate-500"
                >
                  {isSubmitting ? "Saving..." : "Continue"}
                </Button>
                <p className="text-center text-xs text-slate-400">
                  Your number remains private—we use it only for trusted notifications.
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
