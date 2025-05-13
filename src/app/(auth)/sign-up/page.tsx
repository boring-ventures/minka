"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up/components/sign-up-form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function SignUpPage() {
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

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Regístrate</h1>
        <p className="text-black">
          Tu primer paso hacia un impacto positivo comienza aquí.
        </p>
      </div>

      <SignUpForm />

      <div className="mt-8 text-center">
        <p className="text-black">
          ¿Ya formas parte de Minka?{" "}
          <Link
            href="/sign-in"
            className="text-[#2c6e49] font-medium hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
