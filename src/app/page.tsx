import { HeroSection } from "@/components/views/landing-page/HeroSection";
import { CausesSection } from "@/components/views/landing-page/CausesSection";
import { TrustSection } from "@/components/views/landing-page/TrustSection";
import { StartCampaignSection } from "@/components/views/landing-page/StartCampaignSection";
import { TestimonialsSection } from "@/components/views/landing-page/TestimonialsSection";
import { PartnersSection } from "@/components/views/landing-page/PartnersSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f7e9]">
      <main className="flex-grow">
        <HeroSection />
        <CausesSection />
        <TrustSection />
        <StartCampaignSection />
        <TestimonialsSection />
        <PartnersSection />
      </main>
    </div>
  );
}
