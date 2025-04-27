"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { useAuth } from "@/providers/auth-provider";
import { useDb } from "@/hooks/use-db";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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

export default function ManageCampaignsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { getProfile, getCampaigns, getOrganizers } = useDb();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formattedCampaigns, setFormattedCampaigns] = useState<
    FormattedCampaign[]
  >([]);

  useEffect(() => {
    async function loadData() {
      if (!user) {
        router.push("/sign-in");
        return;
      }

      try {
        // Fetch user profile to check role
        const prismaProfile = await getProfile(user.id);

        if (!prismaProfile) {
          router.push("/sign-in");
          return;
        }

        // Convert to ProfileData
        const getISOString = (dateVal: any): string => {
          if (typeof dateVal === "string") return dateVal;
          if (dateVal instanceof Date) return dateVal.toISOString();
          return new Date().toISOString();
        };

        const profileData: ProfileData = {
          id: prismaProfile.id,
          name: prismaProfile.name,
          email: prismaProfile.email,
          phone: prismaProfile.phone,
          address: prismaProfile.address || "",
          role: prismaProfile.role,
          created_at: getISOString(prismaProfile.createdAt),
        };

        setProfile(profileData);
        setIsAdmin(prismaProfile.role === "admin");

        // Fetch campaigns based on role
        const campaigns = await getCampaigns(isAdmin ? undefined : user.id);

        if (campaigns.length > 0) {
          // Get organizer details if admin
          let organizersMap = new Map<string, OrganizerData>();

          if (prismaProfile.role === "admin") {
            const organizerIds = [
              ...new Set(campaigns.map((c) => c.organizerId).filter(Boolean)),
            ];

            if (organizerIds.length > 0) {
              organizersMap = await getOrganizers(organizerIds);
            }
          }

          // Format campaigns with organizer data if needed
          const formatted = campaigns.map((campaign) => {
            const organizer =
              prismaProfile.role === "admin"
                ? organizersMap.get(campaign.organizerId)
                : undefined;

            // Find primary image or use first available
            const mediaUrl =
              campaign.media.find((m) => m.isPrimary)?.mediaUrl ||
              campaign.media[0]?.mediaUrl ||
              "/amboro-main.jpg";

            return {
              id: campaign.id || "",
              title: campaign.title || "Sin título",
              imageUrl: mediaUrl,
              category: campaign.category || "General",
              location: campaign.location || "Bolivia",
              raisedAmount:
                parseFloat(campaign.collectedAmount.toString()) || 0,
              goalAmount: parseFloat(campaign.goalAmount.toString()) || 1,
              progress:
                parseFloat(campaign.goalAmount.toString()) > 0
                  ? Math.round(
                      ((parseFloat(campaign.collectedAmount.toString()) || 0) /
                        parseFloat(campaign.goalAmount.toString())) *
                        100
                    ) || 0
                  : 0,
              status: (campaign.campaignStatus as CampaignStatus) || "draft",
              description: campaign.description || "",
              isVerified: campaign.verificationStatus || false,
              organizerName: organizer?.name ?? undefined,
              organizerEmail: organizer?.email ?? undefined,
            };
          });

          setFormattedCampaigns(formatted);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, router, getProfile, getCampaigns, getOrganizers, isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {displayActiveCampaigns.map((campaign: FormattedCampaign) => (
                <div key={campaign.id} className="relative h-full">
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
                  <div className="absolute top-3 right-3 z-10">
                    <Link
                      href={`/dashboard/campaigns/${campaign.id}`}
                      className="bg-white rounded-full w-9 h-9 flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors duration-200"
                      aria-label="Edit campaign"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
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
                            className="bg-white rounded-full w-9 h-9 flex items-center justify-center shadow-md hover:bg-gray-100 transition-colors duration-200"
                            aria-label="Edit campaign"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
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
