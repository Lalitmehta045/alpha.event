"use client";

import AuthForm from "@/components/auth/AuthForm";
import AuthLayout from "@/components/auth/AuthLayout";

export default function VendorRegisterPage() {
  return (
    <AuthLayout isSignUp={true} isVendor={true}>
      <AuthForm isSignUp={true} isSignIn={false} isVendor={true} />
    </AuthLayout>
  );
}
