"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DonationsHistoryTable } from "@/components/dashboard/donations-history-table";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { useUserDonations } from "@/hooks/use-user-donations";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function DonationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  // Get current page from URL or default to 1
  const currentPage = searchParams.get("page")
    ? parseInt(searchParams.get("page") || "1")
    : 1;

  const pageSize = 6;

  // Check user authentication
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/sign-in");
      } else {
        setHasSession(true);
      }
      setIsLoading(false);
    };

    checkSession();
  }, [supabase, router]);

  // Use our custom hook to fetch donations
  const {
    donations,
    meta,
    isLoading: isDonationsLoading,
    isError,
  } = useUserDonations(currentPage, pageSize);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <LoadingSpinner size="md" showText text="Cargando..." />
      </div>
    );
  }

  // If user is not authenticated, this will redirect (see useEffect)
  if (!hasSession) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Historial de donaciones
      </h1>

      {isDonationsLoading ? (
        <div className="bg-white rounded-lg p-6 shadow-sm h-96 flex items-center justify-center">
          <LoadingSpinner size="sm" showText text="Cargando donaciones..." />
        </div>
      ) : isError ? (
        <div className="bg-red-50 rounded-lg p-6 text-red-500">
          Ocurrió un error al cargar tus donaciones. Por favor intenta
          nuevamente.
        </div>
      ) : donations.length > 0 ? (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <DonationsHistoryTable
            donations={donations}
            currentPage={meta.currentPage}
            totalPages={meta.totalPages}
          />
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg py-12 px-4 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-6">
            <Info className="h-6 w-6 text-blue-500" />
          </div>

          <p className="text-gray-800 text-lg text-center mb-8">
            Aún no has realizado ninguna donación. ¡Es un buen momento para
            empezar!
          </p>

          <Button
            className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full px-8 py-3 text-base"
            asChild
          >
            <Link href="/campaigns">Donar ahora</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
