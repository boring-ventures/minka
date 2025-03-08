import { Header } from "@/components/Header"
import { CreateCampaignHeader } from "@/components/campaign/CreateCampaignHeader"
import { CampaignForm } from "@/components/campaign/CampaignForm"

export default function CreateCampaignPage() {
  return (
    <div className="min-h-screen bg-[#f5f7e9]">
      <Header />
      <CreateCampaignHeader />

      <main className="container mx-auto px-4 py-16">
        <CampaignForm />
      </main>
    </div>
  )
}

