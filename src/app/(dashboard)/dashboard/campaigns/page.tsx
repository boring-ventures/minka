import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignCard } from "@/components/dashboard/campaign-card";
import { CompletedCampaignCard } from "@/components/dashboard/completed-campaign-card";

export default async function ManageCampaignsPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Get user's campaigns
  const { data: userCampaigns } = await supabase
    .from("campaigns")
    .select("*, categories(name)")
    .eq("organizer_id", session.user.id)
    .order("created_at", { ascending: false });

  // For now, let's use placeholder data to match the image example
  const activeCampaigns = [
    {
      id: "1",
      title: "Protejamos juntos el Parque Nacional Amboró",
      imageUrl: "/amboro-main.jpg",
      category: "Medio ambiente",
      location: "Bolivia, Santa Cruz",
      raisedAmount: 1200,
      goalAmount: 1500,
      progress: 80,
      status: "active",
    },
    {
      id: "2",
      title: "Protejamos juntos el Parque Nacional Amboró",
      imageUrl: "/amboro-main.jpg",
      category: "Medio ambiente",
      location: "Bolivia, Santa Cruz",
      raisedAmount: 1200,
      goalAmount: 1500,
      progress: 80,
      status: "pending_verification",
    },
    {
      id: "3",
      title: "Protejamos juntos el Parque Nacional Amboró",
      imageUrl: "/amboro-main.jpg",
      category: "Medio ambiente",
      location: "Bolivia, Santa Cruz",
      raisedAmount: 1200,
      goalAmount: 1500,
      progress: 80,
      status: "in_revision",
    },
  ];

  const completedCampaigns = [
    {
      id: "4",
      title: "Una nueva sonrisa para Mateo: ¡Gracias por tu apoyo!",
      imageUrl: "/amboro-main.jpg",
      description: "",
    },
    {
      id: "5",
      title: "Energía limpia para comunidades rurales",
      imageUrl: "/amboro-main.jpg",
      description: "",
    },
  ];

  // Format real data for use in components
  const mappedRealCampaigns = userCampaigns?.map((campaign) => ({
    id: campaign.id,
    title: campaign.title,
    imageUrl: campaign.image_url || "/amboro-main.jpg",
    category: campaign.categories?.name || "General",
    location: campaign.location || "Bolivia",
    raisedAmount: campaign.current_amount || 0,
    goalAmount: campaign.goal_amount || 1,
    progress:
      campaign.goal_amount > 0
        ? Math.round((campaign.current_amount / campaign.goal_amount) * 100) ||
          0
        : 0,
    status: campaign.status || "draft",
    description: campaign.description || "",
  }));

  // Use real data in production, placeholder for development
  const displayActiveCampaigns =
    process.env.NODE_ENV === "development"
      ? activeCampaigns
      : mappedRealCampaigns?.filter((c) => c.status !== "completed") || [];

  const displayCompletedCampaigns =
    process.env.NODE_ENV === "development"
      ? completedCampaigns
      : mappedRealCampaigns?.filter((c) => c.status === "completed") || [];

  // For testing empty state, uncomment the following lines
  // const displayActiveCampaigns = [];
  // const displayCompletedCampaigns = [];

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

      {displayActiveCampaigns && displayActiveCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayActiveCampaigns.map((campaign) => (
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

      {displayCompletedCampaigns && displayCompletedCampaigns.length > 0 && (
        <div className="space-y-6 mt-10">
          <h2 className="text-2xl font-bold text-gray-800">
            Campañas completadas
          </h2>
          <div className="space-y-6">
            {displayCompletedCampaigns.map((campaign, index) => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
