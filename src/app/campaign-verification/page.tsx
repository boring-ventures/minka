import type { Metadata } from "next";
import { CampaignVerificationView } from "@/components/views/campaign-verification/CampaignVerificationView";
import { Header } from "@/components/views/landing-page/Header";
import { Footer } from "@/components/views/landing-page/Footer";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Verificación de Campañas | Minka",
  description:
    "Verifica tu campaña en Minka para aumentar su credibilidad y atraer más apoyo para tu causa",
};

export default function CampaignVerificationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-[#f5f7e9]">
      <Header />
      <div className="w-full h-[400px] relative">
        <Image
          src="/page-header.svg"
          alt="Page Header"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-[90px] font-bold text-white">
            Verifica tu campaña
          </h1>
        </div>
      </div>
      <main className="overflow-x-hidden">
        <div className="container mx-auto px-4 py-16">
          <CampaignVerificationView />
        </div>
      </main>
      <Footer />
    </div>
  );
}
