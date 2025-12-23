import AuthForm from "@/components/auth/AuthForm";
import AuthLayout from "@/components/auth/AuthLayout";

export default function SignInPage() {
  return (
    <AuthLayout isSignUp={false}>
      <AuthForm isSignUp={false} isSignIn={true} />
    </AuthLayout>
  );
}
