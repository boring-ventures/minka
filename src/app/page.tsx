import Head from "next/head";
import { HeroSection } from "@/components/views/landing-page/HeroSection";
import { CausesSection } from "@/components/views/landing-page/CausesSection";
import { TrustSection } from "@/components/views/landing-page/TrustSection";
import { StartCampaignSection } from "@/components/views/landing-page/StartCampaignSection";
import { TestimonialsSection } from "@/components/views/landing-page/TestimonialsSection";
import { PartnersSection } from "@/components/views/landing-page/PartnersSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f7e9]">
      <Head>
        <title>MINKA - Impulsa sueños, transforma vidas</title>
        <meta
          name="description"
          content="Plataforma de donaciones para causas sociales en Bolivia"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex-grow">
        <main className="flex-grow">
          <HeroSection />
          <CausesSection />
          <TrustSection />
          <StartCampaignSection />
          <TestimonialsSection />
          <PartnersSection />
        </main>
      </div>
    </div>
  );
}
