import { CreateCampaignHeader } from "@/components/views/create-campaign/CreateCampaignHeader";
import { CampaignForm } from "@/components/views/create-campaign/CampaignForm";
import { Header } from "@/components/views/landing-page/Header";
import { Footer } from "@/components/views/landing-page/Footer";
import Image from "next/image";
import { CampaignFormProvider } from "@/components/providers/campaign-form-provider";

export default function CreateCampaignPage() {
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
          <h1 className="text-[90px] font-bold text-white">Crea tu campaña</h1>
        </div>
      </div>
      <main className="overflow-x-hidden">
        <CreateCampaignHeader />
        <div className="container mx-auto px-4 py-16">
          <CampaignFormProvider>
            <CampaignForm />
          </CampaignFormProvider>
        </div>
      </main>
      <Footer />
    </div>
  );
}
