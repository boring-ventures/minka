"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Award } from "lucide-react";
import { notFound, useParams } from "next/navigation";

import { CampaignGallery } from "@/components/views/campaign/CampaignGallery";
import { CampaignProgress } from "@/components/views/campaign/CampaignProgress";
import { StickyProgressWrapper } from "@/components/views/campaign/StickyProgressWrapper";
import { Header } from "@/components/views/landing-page/Header";
import { Footer } from "@/components/views/landing-page/Footer";
import { CampaignCard } from "@/components/views/campaigns/CampaignCard";
import { CampaignUpdates } from "@/components/views/campaign/CampaignUpdates";
import { Button } from "@/components/ui/button";
import Loading from "./loading";
import { useCampaign, Campaign } from "@/hooks/useCampaign";

interface CampaignMedia {
  id: string;
  campaign_id: string;
  media_url: string;
  type: "image" | "video";
  is_primary: boolean;
  order_index: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

interface CampaignOrganizer {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
  location?: string;
  join_date: string;
  active_campaigns_count: number;
  bio?: string;
  verification_status: boolean;
}

interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  youtube_url?: string;
  image_url?: string;
  created_at: string;
}

interface DonorComment {
  id: string;
  message: string;
  created_at: string;
  profile: {
    id: string;
    name: string;
  };
}

interface CampaignData {
  id: string;
  title: string;
  description: string;
  beneficiaries_description: string;
  category: string;
  goal_amount: number;
  collected_amount: number;
  donor_count: number;
  percentage_funded: number;
  days_remaining: number;
  youtube_url?: string;
  youtube_urls?: string[];
  location: string;
  end_date: string;
  verification_status: boolean;
  created_at: string;
  organizer_id: string;
  media: CampaignMedia[];
  organizer: CampaignOrganizer;
  updates: CampaignUpdate[];
  comments: DonorComment[];
}

// Helper function to format campaign data for components
function formatCampaignData(campaign: any) {
  // Format gallery images
  const galleryItems =
    campaign.media?.map((item: any) => ({
      url: item.media_url,
      type: item.type as "image" | "video",
      id: item.id,
    })) || [];

  // Format updates from campaign data
  const formattedUpdates: Array<{
    id: string;
    title: string;
    message: string;
    createdAt: string;
    imageUrl?: string;
    youtubeUrl?: string;
  }> =
    campaign.updates?.map((update: any) => ({
      id: update.id,
      title: update.title,
      message: update.content,
      createdAt: update.created_at,
      imageUrl: update.image_url,
      youtubeUrl: update.youtube_url,
    })) || [];

  // Format comments from campaign data
  const formattedComments: Array<{
    donor: string;
    amount: number;
    date: string;
    comment: string;
  }> =
    campaign.comments?.map((comment: any) => ({
      donor: comment.profile?.name || "Anonymous",
      amount: 0, // We don't have amount in comments
      date: new Date(comment.created_at).toLocaleDateString(),
      comment: comment.message,
    })) || [];

  const progressData = {
    isVerified: campaign.verification_status || false,
    createdAt: campaign.created_at
      ? new Date(campaign.created_at).toLocaleDateString()
      : new Date().toLocaleDateString(),
    currentAmount: campaign.collected_amount || 0,
    targetAmount: campaign.goal_amount || 0,
    donorsCount: campaign.donor_count || 0,
  };

  // Create default organizer data structure
  const organizerData = {
    name: campaign.organizer?.name || "Organizador",
    role: "Organizador de campaña",
    location: campaign.organizer?.location || campaign.location || "Bolivia",
    memberSince: campaign.organizer?.join_date
      ? new Date(campaign.organizer.join_date).getFullYear().toString()
      : new Date().getFullYear().toString(),
    successfulCampaigns: campaign.organizer?.active_campaigns_count || 0,
    bio: campaign.organizer?.bio || "Sin biografía",
  };

  return {
    title: campaign.title,
    description: campaign.description,
    beneficiaries: campaign.beneficiaries_description || campaign.description,
    images: galleryItems,
    progress: progressData,
    organizer: organizerData,
    comments: formattedComments,
    updates: formattedUpdates,
  };
}

// Helper to format category for display
function formatCategory(category: string) {
  const categories: Record<string, string> = {
    educacion: "Educación",
    salud: "Salud",
    medioambiente: "Medioambiente",
    cultura_arte: "Cultura y arte",
    emergencia: "Emergencia",
    igualdad: "Igualdad",
  };

  return categories[category] || category;
}

// Async function to fetch related campaigns
async function fetchRelatedCampaigns(category: string, id: string) {
  try {
    const response = await fetch(
      `/api/campaign/related?category=${category}&excludeId=${id}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch related campaigns");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching related campaigns:", error);
    return [];
  }
}

// Custom CampaignDetails component
function CustomCampaignDetails({
  organizer,
  description,
  beneficiaries,
}: {
  organizer: {
    name: string;
    role: string;
    location: string;
    memberSince: string;
    successfulCampaigns: number;
    bio: string;
  };
  description: string;
  beneficiaries: string;
}) {
  return (
    <div className="space-y-8">
      {/* Organizer Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
        <div className="h-10 w-10 rounded-full bg-[#e8f0e9] flex items-center justify-center">
          <span className="text-sm font-medium text-[#2c6e49]">
            {organizer.name[0]}
          </span>
        </div>
        <div>
          <h3 className="font-medium text-[#2c6e49]">{organizer.name}</h3>
          <p className="text-sm text-gray-600">
            {organizer.role} | {organizer.location}
          </p>
        </div>
      </div>

      {/* Verification Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Image
            src="/landing-page/step-2.png"
            alt="Verified"
            width={32}
            height={32}
            className="text-[#2c6e49]"
          />
          <span className="text-[#2c6e49] text-xl font-medium">
            Campaña verificada por Minka
          </span>
        </div>
        <Link href="#" className="text-[#2c6e49] underline text-base">
          Más información sobre la verificación
        </Link>
      </div>

      {/* Campaign Description */}
      <div className="space-y-4 pb-8 border-b border-gray-200">
        <h2 className="text-3xl md:text-4xl font-semibold text-[#2c6e49]">
          Descripción de la campaña
        </h2>
        <p className="text-gray-700 leading-relaxed">{description}</p>
      </div>

      {/* Beneficiaries */}
      <div className="space-y-4 pb-8 border-b border-gray-200">
        <h2 className="text-3xl md:text-4xl font-semibold text-[#2c6e49]">
          Beneficiarios
        </h2>
        <p className="text-gray-700 leading-relaxed">{beneficiaries}</p>
      </div>

      {/* About Organizer */}
      <div className="space-y-6 pb-8 border-b border-gray-200">
        <h2 className="text-3xl md:text-4xl font-semibold text-[#2c6e49]">
          Sobre el organizador
        </h2>
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-[#e8f0e9] flex items-center justify-center">
            <span className="text-sm font-medium text-[#2c6e49]">
              {organizer.name[0]}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-[#2c6e49]">{organizer.name}</h3>
            <p className="text-sm text-gray-600">
              Gestor de campaña | {organizer.location}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#2c6e49]" />
            <span className="text-lg font-medium text-[#2c6e49]">
              Tiempo en la plataforma
            </span>
          </div>
          <p className="pl-6 text-lg">Miembro desde {organizer.memberSince}</p>

          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[#2c6e49]" />
            <span className="text-lg font-medium text-[#2c6e49]">
              Otras campañas
            </span>
          </div>
          <p className="pl-6 text-lg">
            {organizer.successfulCampaigns} campañas exitosas
          </p>
        </div>

        <div>
          <h4 className="font-medium mb-2 text-xl text-[#2c6e49]">Biografía</h4>
          <p className="text-black">{organizer.bio}</p>
        </div>
      </div>
    </div>
  );
}

// Custom donor comments component
function CustomDonorComments({ comments }: { comments: any[] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl md:text-4xl font-semibold text-[#2c6e49]">
        Comentarios de donadores
      </h2>
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div
              key={index}
              className="border-b border-gray-200 pb-6 last:border-0"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">{comment.donor}</span>
                <span className="text-sm text-gray-500">
                  donó hace {comment.date}
                </span>
              </div>
              <p className="text-gray-700">{comment.comment}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">
            Aún no hay comentarios en esta campaña.
          </p>
        )}
      </div>
    </div>
  );
}

export default function CampaignPage() {
  const params = useParams();
  const campaignId = params?.id as string;
  console.log("Rendering campaign page for ID:", campaignId);

  const { campaign, isLoading, error } = useCampaign(campaignId);
  const [relatedCampaigns, setRelatedCampaigns] = useState<any[]>([]);
  const [formattedCampaign, setFormattedCampaign] = useState<any>(null);

  useEffect(() => {
    console.log("Campaign data state:", { campaign, isLoading, error });

    if (campaign) {
      console.log("Setting formatted campaign with data:", campaign);
      setFormattedCampaign(formatCampaignData(campaign));

      // Fetch related campaigns when we have the main campaign data
      // Use location as the category parameter since Campaign doesn't have a category field
      fetchRelatedCampaigns(campaign.location, campaign.id).then((data) => {
        setRelatedCampaigns(data?.campaigns || []);
      });
    }
  }, [campaign, isLoading, error]);

  if (isLoading) {
    console.log("Campaign is loading...");
    return <Loading />;
  }

  // Separate conditions for better debugging
  if (error) {
    console.error("Error from useCampaign hook:", error);
    return notFound();
  }

  if (!campaign) {
    console.error("No campaign data returned (null campaign)");
    return notFound();
  }

  if (!formattedCampaign) {
    console.log("Waiting for formatted campaign data...");
    return <Loading />;
  }

  console.log("Rendering campaign:", formattedCampaign.title);

  return (
    <>
      <Header />
      <div className="pt-24 bg-[#fbfbf6]">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Campaign Gallery and Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16 pt-8">
            <div className="lg:col-span-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-6 text-black">
                {formattedCampaign.title}
              </h1>
              <CampaignGallery
                images={formattedCampaign.images}
                campaignTitle={formattedCampaign.title}
              />
            </div>
            <div className="lg:col-span-4">
              <StickyProgressWrapper>
                <CampaignProgress
                  isVerified={formattedCampaign.progress.isVerified}
                  createdAt={formattedCampaign.progress.createdAt}
                  currentAmount={formattedCampaign.progress.currentAmount}
                  targetAmount={formattedCampaign.progress.targetAmount}
                  donorsCount={formattedCampaign.progress.donorsCount}
                  campaignTitle={formattedCampaign.title}
                  campaignOrganizer={formattedCampaign.organizer.name}
                  campaignLocation={formattedCampaign.organizer.location}
                  campaignId={campaignId}
                />
              </StickyProgressWrapper>
            </div>
          </div>

          {/* Campaign Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16">
            <div className="lg:col-span-8">
              <CustomCampaignDetails
                organizer={formattedCampaign.organizer}
                description={formattedCampaign.description}
                beneficiaries={formattedCampaign.beneficiaries}
              />
            </div>

            <div className="lg:col-span-4 space-y-8">
              {/* Updates Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
                <CampaignUpdates updates={formattedCampaign.updates} />
                <div className="pt-4">
                  <p className="text-[#2c6e49] text-center hover:underline">
                    <Link
                      href="#all-updates"
                      className="flex items-center justify-center gap-1"
                    >
                      Ver todos los anuncios
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <CustomDonorComments comments={formattedCampaign.comments} />
                <div className="pt-4">
                  <p className="text-[#2c6e49] text-center hover:underline">
                    <Link
                      href="#all-comments"
                      className="flex items-center justify-center gap-1"
                    >
                      Ver todos los comentarios
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Campaigns Section */}
          <div className="pb-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              Campañas similares
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  id={campaign.id}
                  title={campaign.title}
                  image={campaign.image || campaign.primaryImage}
                  category={formatCategory(campaign.category)}
                  location={campaign.location}
                  progress={campaign.percentageFunded || campaign.progress}
                  description={campaign.description}
                  donorCount={campaign.donorCount}
                  amountRaised={`Bs. ${campaign.collectedAmount || campaign.collected_amount || 0}`}
                />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
