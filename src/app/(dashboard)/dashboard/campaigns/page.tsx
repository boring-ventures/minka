import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CampaignCard,
  CampaignStatus,
} from "@/components/dashboard/campaign-card";
import { CompletedCampaignCard } from "@/components/dashboard/completed-campaign-card";

interface CampaignMedia {
  media_url: string;
  is_primary: boolean;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  collected_amount: number;
  goal_amount: number;
  campaign_status: CampaignStatus;
  created_at: string;
  verification_status: string;
  organizer_id: string;
  media: CampaignMedia[];
}

interface FormattedCampaign {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  location: string;
  raisedAmount: number;
  goalAmount: number;
  progress: number;
  status: CampaignStatus;
  description: string;
}

export default async function ManageCampaignsPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Get user's campaigns directly from Supabase
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select(
      `
      id,
      title,
      description,
      category,
      location,
      collected_amount,
      goal_amount,
      campaign_status,
      created_at,
      verification_status,
      organizer_id,
      media:campaign_media(
        media_url,
        is_primary
      )
    `
    )
    .eq("organizer_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching campaigns:", error);
    throw new Error("Failed to fetch campaigns");
  }

  // Format campaigns for display
  const formattedCampaigns = campaigns?.map(
    (campaign: Campaign): FormattedCampaign => ({
      id: campaign.id,
      title: campaign.title,
      imageUrl: campaign.media?.[0]?.media_url || "/amboro-main.jpg",
      category: campaign.category || "General",
      location: campaign.location || "Bolivia",
      raisedAmount: campaign.collected_amount || 0,
      goalAmount: campaign.goal_amount || 1,
      progress:
        campaign.goal_amount > 0
          ? Math.round(
              (campaign.collected_amount / campaign.goal_amount) * 100
            ) || 0
          : 0,
      status: campaign.campaign_status || "draft",
      description: campaign.description || "",
    })
  );

  const displayActiveCampaigns =
    formattedCampaigns?.filter(
      (c: FormattedCampaign) => c.status !== "completed"
    ) || [];
  const displayCompletedCampaigns =
    formattedCampaigns?.filter(
      (c: FormattedCampaign) => c.status === "completed"
    ) || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">
          Administrar mis campañas
        </h1>
        <Button
          className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full flex items-center gap-2"
          asChild
        >
          <Link href="/create-campaign">
            <Plus size={18} />
            Nueva Campaña
          </Link>
        </Button>
      </div>

      {displayActiveCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayActiveCampaigns.map((campaign: FormattedCampaign) => (
            <CampaignCard
              key={campaign.id}
              id={campaign.id}
              title={campaign.title}
              imageUrl={campaign.imageUrl}
              category={campaign.category}
              location={campaign.location}
              raisedAmount={campaign.raisedAmount}
              goalAmount={campaign.goalAmount}
              progress={campaign.progress}
              status={campaign.status}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg py-12 px-4 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-6">
            <Info className="h-6 w-6 text-blue-500" />
          </div>

          <p className="text-gray-800 text-lg text-center mb-8">
            Aún no has creado ninguna campaña. ¡Es un buen momento para
            comenzar!
          </p>

          <Button
            className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full px-8 py-3 text-base flex items-center gap-2"
            asChild
          >
            <Link href="/create-campaign">
              <Plus size={18} />
              Crear mi primera campaña
            </Link>
          </Button>
        </div>
      )}

      {displayCompletedCampaigns.length > 0 && (
        <div className="space-y-6 mt-10">
          <h2 className="text-2xl font-bold text-gray-800">
            Campañas completadas
          </h2>
          <div className="space-y-6">
            {displayCompletedCampaigns.map(
              (campaign: FormattedCampaign, index: number) => (
                <div key={campaign.id} className="space-y-6">
                  <CompletedCampaignCard
                    id={campaign.id}
                    title={campaign.title}
                    imageUrl={campaign.imageUrl}
                    description={campaign.description}
                  />
                  {index < displayCompletedCampaigns.length - 1 && (
                    <div className="h-px bg-gray-200" />
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
