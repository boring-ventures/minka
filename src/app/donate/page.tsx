"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/views/landing-page/Header";
import { Footer } from "@/components/views/landing-page/Footer";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Main donate page that acts as a router or campaign selector
export default function DonatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for campaign ID in query parameters for backward compatibility
  useEffect(() => {
    const id = searchParams.get("id");

    // If an ID is provided, redirect to the dynamic route
    if (id) {
      router.replace(`/donate/${id}`);
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-[#f5f7e9]">
      <Header />

      {/* Spacer div to account for the fixed header height */}
      <div className="h-20 md:h-28"></div>

      {/* Page header with increased height */}
      <div className="w-full h-[300px] md:h-[500px] relative border-t border-[#2c6e49]/5">
        <Image
          src="/page-header.svg"
          alt="Page Header"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[90px] font-bold text-white text-center">
            Elige una campaña para donar
          </h1>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#2c6e49] mb-6">
            Para realizar una donación, elige una campaña
          </h2>
          <p className="text-gray-700 mb-8">
            Puedes explorar nuestras campañas actuales o visitar directamente
            una campaña específica.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white py-6 px-8 rounded-full"
              asChild
            >
              <Link href="/campaigns">Ver todas las campañas</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
