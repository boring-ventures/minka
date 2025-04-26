"use client";

import { Header } from "@/components/views/landing-page/Header";
import { Footer } from "@/components/views/landing-page/Footer";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function Loading() {
  return (
    <>
      <Header />
      <div className="h-20 md:h-28"></div>
      <div className="flex justify-center items-center min-h-[50vh] py-20">
        <LoadingSpinner size="lg" showText text="Cargando campaña..." />
      </div>
      <Footer />
    </>
  );
}
