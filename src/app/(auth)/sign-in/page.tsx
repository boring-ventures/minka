import Link from "next/link";
import { Suspense } from "react";
import { SignInClient } from "./sign-in-client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// This function is used to safely get the registered status from searchParams
function getRegistrationStatus(registered?: string): boolean {
  return registered === "true";
}

// Define proper type for searchParams
export default function SignInPage({
  searchParams,
}: {
  searchParams: { registered?: string };
}) {
  // Get registration status directly from the param
  const isRegistered = getRegistrationStatus(searchParams.registered);

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
          <div className="flex items-center justify-center h-[400px]">
            <LoadingSpinner size="md" showText text="Cargando formulario..." />
          </div>
        }
      >
        <SignInClient />
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
