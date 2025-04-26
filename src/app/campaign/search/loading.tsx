"use client";

import { Header } from "@/components/views/landing-page/Header";
import { Footer } from "@/components/views/landing-page/Footer";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-[#f5f7e9]">
      <Header />
      <div className="pt-24">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#333333] mb-6">
              Buscando campañas...
            </h1>
            <div className="flex justify-center mt-12">
              <LoadingSpinner size="lg" showText text="Buscando resultados" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
