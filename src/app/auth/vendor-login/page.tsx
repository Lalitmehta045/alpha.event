"use client";

import AuthForm from "@/components/auth/AuthForm";
import AuthLayout from "@/components/auth/AuthLayout";

export default function VendorLoginPage() {
  return (
    <AuthLayout isSignUp={false} isVendor={true}>
      <AuthForm isSignUp={false} isSignIn={true} isVendor={true} />
    </AuthLayout>
  );
}
