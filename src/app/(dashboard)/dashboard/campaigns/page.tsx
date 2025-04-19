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
import { ProfileData } from "@/types";
import { AdminCampaignTable } from "@/components/dashboard/admin-campaign-table";

interface CampaignMedia {
  media_url: string;
  is_primary: boolean;
}

// Base Campaign type fetched from Supabase (without profiles initially)
interface BaseCampaign {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  collected_amount: number;
  goal_amount: number;
  campaign_status: CampaignStatus;
  created_at: string;
  verification_status: boolean;
  organizer_id: string;
  media: CampaignMedia[];
}

// Interface for the organizer data fetched separately
interface OrganizerData {
  id: string;
  name: string | null;
  email: string | null;
}

// Final formatted type passed to components
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
  isVerified: boolean;
  organizerName?: string;
  organizerEmail?: string;
}

export default async function ManageCampaignsPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Fetch user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single<Pick<ProfileData, "role">>();

  const isAdmin = profile?.role === "admin";

  // --- Step 1: Fetch base campaign data ---
  const baseSelect = `
    id, title, description, category, location, collected_amount, goal_amount,
    campaign_status, created_at, verification_status, organizer_id,
    media:campaign_media( media_url, is_primary )
  `;

  let query = supabase.from("campaigns").select(baseSelect);

  if (!isAdmin) {
    query = query.eq("organizer_id", session.user.id);
  }

  const { data: baseCampaigns, error: campaignError } = await query.order(
    "created_at",
    {
      ascending: false,
    }
  );

  if (campaignError) {
    console.error("Error fetching campaigns:", JSON.stringify(campaignError));
    return (
      <div className="bg-gray-50 rounded-lg py-12 px-4 flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <Info className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-gray-800 text-lg text-center mb-8">
          Hubo un error al cargar tus campañas. Por favor, intenta nuevamente.
        </p>
        <Button
          className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full px-8 py-3 text-base flex items-center gap-2"
          asChild
        >
          <Link href="/create-campaign">
            <Plus size={18} />
            Crear una campaña
          </Link>
        </Button>
      </div>
    );
  }

  // --- Step 2 & 3: Fetch organizer profiles if admin ---
  let organizersMap: Map<
    string,
    { name: string | null; email: string | null }
  > = new Map();

  if (isAdmin && baseCampaigns && baseCampaigns.length > 0) {
    const organizerIds = [
      ...new Set(baseCampaigns.map((c) => c.organizer_id).filter(Boolean)),
    ]; // Get unique, non-null IDs

    if (organizerIds.length > 0) {
      const { data: organizers, error: profileError } = await supabase
        .from("profiles")
        .select("id, name, email")
        .in("id", organizerIds);

      if (profileError) {
        console.error("Error fetching organizer profiles:", profileError);
        // Optionally handle this error - maybe show campaigns without organizer names
      } else if (organizers) {
        organizers.forEach((org: OrganizerData) => {
          organizersMap.set(org.id, { name: org.name, email: org.email });
        });
      }
    }
  }

  // --- Step 4: Format campaigns, adding organizer data if admin ---
  const formattedCampaigns = (baseCampaigns || []).map(
    (campaign: BaseCampaign): FormattedCampaign => {
      const organizer = isAdmin
        ? organizersMap.get(campaign.organizer_id)
        : undefined;
      return {
        id: campaign.id || "",
        title: campaign.title || "Sin título",
        imageUrl: campaign.media?.[0]?.media_url || "/amboro-main.jpg",
        category: campaign.category || "General",
        location: campaign.location || "Bolivia",
        raisedAmount: campaign.collected_amount || 0,
        goalAmount: campaign.goal_amount || 1,
        progress:
          campaign.goal_amount > 0
            ? Math.round(
                ((campaign.collected_amount || 0) / campaign.goal_amount) * 100
              ) || 0
            : 0,
        status: campaign.campaign_status || "draft",
        description: campaign.description || "",
        isVerified: campaign.verification_status || false,
        organizerName: organizer?.name ?? undefined,
        organizerEmail: organizer?.email ?? undefined,
      };
    }
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
          {isAdmin ? "Manage All Campaigns" : "Administrar mis campañas"}
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

      {isAdmin ? (
        <div className="bg-card rounded-lg p-6 border">
          <AdminCampaignTable campaigns={formattedCampaigns} />
        </div>
      ) : (
        <>
          {displayActiveCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayActiveCampaigns.map((campaign: FormattedCampaign) => (
                <div key={campaign.id} className="relative">
                  <CampaignCard
                    id={campaign.id}
                    title={campaign.title}
                    imageUrl={campaign.imageUrl}
                    category={campaign.category}
                    location={campaign.location}
                    raisedAmount={campaign.raisedAmount}
                    goalAmount={campaign.goalAmount}
                    progress={campaign.progress}
                    status={campaign.status}
                    isVerified={campaign.isVerified}
                  />
                  <div className="absolute top-2 right-2 z-10">
                    <Link
                      href={`/dashboard/campaigns/${campaign.id}`}
                      className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-[#2c6e49]"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </Link>
                  </div>
                </div>
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
                      <div className="relative">
                        <CompletedCampaignCard
                          id={campaign.id}
                          title={campaign.title}
                          imageUrl={campaign.imageUrl}
                          description={campaign.description}
                        />
                        <div className="absolute top-4 right-4">
                          <Link
                            href={`/dashboard/campaigns/${campaign.id}`}
                            className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-[#2c6e49]"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </Link>
                        </div>
                      </div>
                      {index < displayCompletedCampaigns.length - 1 && (
                        <div className="h-px bg-gray-200" />
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
