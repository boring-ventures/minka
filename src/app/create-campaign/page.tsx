import { CreateCampaignHeader } from "@/components/views/create-campaign/CreateCampaignHeader";
import { CampaignForm } from "@/components/views/create-campaign/CampaignForm";

export default function CreateCampaignPage() {
  return (
    <div className="min-h-screen bg-[#f5f7e9]">
      <main>
        <CreateCampaignHeader />
        <div className="container mx-auto px-4 py-16">
          <CampaignForm />
        </div>
      </main>
    </div>
  );
}
