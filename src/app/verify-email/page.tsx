"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { signUp } from "@/services/operations/auth";
import { Card } from "@/components/ui/card";
import { formatTimer } from "@/utils/formatTimer";
import { maskedEmail } from "@/utils/maskedEmail";

export default function VerifyEmailPage() {
  const router = useRouter();

  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [timer, setTimer] = useState(120);
  const [maskEmail, setMaskEmail] = useState("");
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [resetEmail, setResetEmail] = useState<string | null>(null);
  const [mode, setMode] = useState<"register" | "forgot">("register");

  // Detect mode → signup or forgot
  useEffect(() => {
    const storedUser = localStorage.getItem("pendingUser");
    const storedResetEmail = localStorage.getItem("resetEmail");

    if (storedResetEmail) {
      setMode("forgot");
      setResetEmail(storedResetEmail);
      setMaskEmail(maskedEmail(storedResetEmail));
    } else if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setPendingUser(parsed);
      setMaskEmail(maskedEmail(parsed.email));
      setMode("register");
    } else {
      toast.error("Invalid session");
      router.push("/auth/sign-in");
    }
  }, []);

  // Timer
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // OTP Input
  const handleChange = (value: string, index: number) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otpValues];
      newOtp[index] = value;
      setOtpValues(newOtp);

      if (value && index < otpValues.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // FINAL VERIFY
  const verifyOtp = async () => {
    const otp = otpValues.join("");

    if (otp.length !== 6) {
      toast.error("Please enter 6-digit OTP");
      return;
    }

    // --- REGISTER MODE ---
    if (mode === "register") {
      if (!pendingUser?.email) {
        toast.error("Invalid session");
        router.push("/auth/sign-up");
        return;
      }

      await signUp(
        pendingUser.fname,
        pendingUser.lname,
        pendingUser.email,
        pendingUser.phone,
        pendingUser.password,
        pendingUser.confirmPassword,
        Number(otp),
        router
      );

      localStorage.removeItem("pendingUser");
      router.push("/auth/sign-in");
      return;
    }

    // --- FORGOT PASSWORD MODE ---
    if (mode === "forgot") {
      localStorage.setItem("otpReset", otp); // Store OTP for reset page
      router.push("/reset-password");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-4 py-10">
      <Card className="w-full max-w-md p-6 shadow-xl rounded-2xl border border-gray-200 bg-white relative">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          ←
        </button>

        <div className="mt-6 flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-1 text-gray-800">
            Enter Your OTP
          </h1>

          <p className="text-gray-500 text-center text-sm">
            {mode === "register"
              ? "We sent a verification code to:"
              : "We sent a password reset code to:"}
          </p>

          {/* Email */}
          <p className="text-indigo-600 font-medium mb-6">{maskEmail}</p>

          {/* OTP Inputs */}
          <div className="flex gap-3 mb-5">
            {otpValues.map((val, index) => (
              <input
                key={index}
                ref={(el: any) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={val}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center border border-gray-300 rounded-xl text-xl font-semibold focus:ring-2 focus:ring-indigo-500"
              />
            ))}
          </div>

          {/* Timer */}
          <p className="text-sm text-gray-600 mb-6">
            Resend Code in{" "}
            <span className="text-indigo-600 font-semibold">
              {formatTimer(timer)}
            </span>
          </p>

          {/* Verify Button */}
          <button
            onClick={verifyOtp}
            className="w-full bg-indigo-600 cursor-pointer text-white py-3 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition"
          >
            Verify
          </button>
        </div>
      </Card>
    </div>
  );
}
