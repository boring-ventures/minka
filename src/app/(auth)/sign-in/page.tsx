import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Use a loading boundary for the form component
const SignInForm = dynamic(
  () =>
    import("@/components/auth/sign-in/components/sign-in-form").then((mod) => ({
      default: mod.SignInForm,
    })),
  {
    ssr: true,
    loading: () => (
      <div className="flex items-center justify-center h-[400px] animate-pulse">
        Cargando formulario...
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Inicia sesión en tu cuenta de Minka",
};

// This function is used to safely get the registered status from searchParams
function getRegistrationStatus(searchParams: { registered?: string }): boolean {
  return searchParams?.registered === "true";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function SignInPage({ searchParams }: any) {
  // We'll calculate the registration status once, outside of any components or hooks
  const isRegistered = getRegistrationStatus(searchParams);

  const supabase = createServerComponentClient({
    cookies: () => cookies(),
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bienvenido de vuelta</h1>
        <p className="text-black">
          Vuelve a conectarte con proyectos que inspiran.
        </p>
      </div>

      {isRegistered && (
        <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-md">
          <p>
            ¡Tu cuenta ha sido creada exitosamente! Ahora puedes iniciar sesión.
          </p>
        </div>
      )}

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-[400px] animate-pulse">
            Cargando formulario...
          </div>
        }
      >
        <SignInForm />
      </Suspense>

      <div className="mt-8 text-center">
        <p className="text-black">
          ¿Es la primera vez que usas Minka?{" "}
          <Link
            href="/sign-up"
            className="text-[#2c6e49] font-medium hover:underline"
            prefetch={true}
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
