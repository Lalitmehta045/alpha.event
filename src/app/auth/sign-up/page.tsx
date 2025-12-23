import AuthForm from "@/components/auth/AuthForm";
import AuthLayout from "@/components/auth/AuthLayout";

export default function SignUpPage() {
  return (
    <AuthLayout isSignUp={true}>
      <AuthForm isSignUp={true} isSignIn={false} />
    </AuthLayout>
  );
}
