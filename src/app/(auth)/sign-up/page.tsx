import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up/components/sign-up-form";

export const metadata: Metadata = {
  title: "Regístrate",
  description: "Crea una cuenta en Minka",
};

export default async function SignUpPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
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