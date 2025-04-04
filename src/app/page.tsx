import { HeroSection } from "@/components/views/landing-page/HeroSection";
import { CausesSection } from "@/components/views/landing-page/CausesSection";
import { TrustSection } from "@/components/views/landing-page/TrustSection";
import { StartCampaignSection } from "@/components/views/landing-page/StartCampaignSection";
import { TestimonialsSection } from "@/components/views/landing-page/TestimonialsSection";
import { PartnersSection } from "@/components/views/landing-page/PartnersSection";
import { Header } from "@/components/views/landing-page/Header";
import { Footer } from "@/components/views/landing-page/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-[#f5f7e9]">
      <Header />
      <main className="flex-grow pt-20 md:pt-24">
        <HeroSection />
        <CausesSection />
        <TrustSection />
        <StartCampaignSection />
        <TestimonialsSection />
        <PartnersSection />
      </main>
      <Footer />
    </div>
  );
}
