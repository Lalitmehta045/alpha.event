"use client";

import Image from "next/image";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import SignupImage from "@/assets/images/SignupImage.png";
import SigninImage from "@/assets/images/SiginImage.png";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function AuthLayout({
  isSignUp,
  isVendor,
  children,
}: {
  isSignUp: boolean;
  isVendor?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-gray-50 relative overflow-hidden">
      {/* LEFT SIDE */}
      <div className="relative z-10 hidden md:flex flex-col items-center justify-center w-1/2 p-10">
        <Image
          src={isSignUp ? SignupImage : SigninImage}
          alt={isSignUp ? "Register" : "Log-In"}
          width={480}
          height={480}
          className="mb-6 object-contain"
        />
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          {isSignUp
            ? isVendor
              ? "Join as a Vendor and Grow with Us!"
              : "Join Us and Start Your Journey!"
            : isVendor
            ? "Welcome Back, Vendor!"
            : "Welcome Back!"}
        </h2>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative z-10 flex w-full md:w-1/2 items-center justify-center p-4">
        <Card className="w-full max-w-xl shadow-lg rounded-2xl relative px-3 py-8 gap-5 md:gap-6">
          {/* Back Button */}
          <button
            onClick={() => router.push("/")}
            className="absolute left-4 top-4 text-gray-500 hover:text-gray-800"
          >
            <FaArrowLeft size={18} />
          </button>
          <CardHeader className="text-center mt-8">
            <CardTitle className="text-3xl font-semibold text-gray-800">
              {isSignUp ? (isVendor ? "Vendor Registration" : "Register") : (isVendor ? "Vendor Log-In" : "Log-In")}
            </CardTitle>
            <p className="text-lg mt-2 text-gray-500">
              {isSignUp
                ? "Create your account to get started."
                : "Logged In to access your account."}
            </p>
          </CardHeader>
          {children}
        </Card>
      </div>
    </div>
  );
}
