import { CreateCampaignHeader } from "@/components/views/create-campaign/CreateCampaignHeader";
import { CampaignForm } from "@/components/views/create-campaign/CampaignForm";
import { Header } from "@/components/views/landing-page/Header";
import { Footer } from "@/components/views/landing-page/Footer";

export default function CreateCampaignPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-[#f5f7e9]">
      <Header />
      <main>
        <CreateCampaignHeader />
        <div className="container mx-auto px-4 py-16">
          <CampaignForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
