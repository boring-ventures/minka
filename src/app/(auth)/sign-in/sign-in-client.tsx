"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Use a loading boundary for the form component
const SignInForm = dynamic(
  () =>
    import("@/components/auth/sign-in/components/sign-in-form").then((mod) => ({
      default: mod.SignInForm,
    })),
  {
    ssr: true,
    loading: () => (
      <div className="flex items-center justify-center h-[400px]">
        <LoadingSpinner size="md" showText text="Cargando formulario..." />
      </div>
    ),
  }
);

export function SignInClient() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  // If loading or already authenticated, show loading state with the spinner
  if (isLoading || user) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <LoadingSpinner size="md" showText text="Cargando..." />
      </div>
    );
  }

  return <SignInForm />;
}
