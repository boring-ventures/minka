import { Suspense } from "react";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Award } from "lucide-react";

import { CampaignGallery } from "@/components/views/campaign/CampaignGallery";
import { CampaignProgress } from "@/components/views/campaign/CampaignProgress";
import { StickyProgressWrapper } from "@/components/views/campaign/StickyProgressWrapper";
import { Header } from "@/components/views/landing-page/Header";
import { Footer } from "@/components/views/landing-page/Footer";
import { CampaignCard } from "@/components/views/campaigns/CampaignCard";
import { CampaignUpdates } from "@/components/views/campaign/CampaignUpdates";
import { Button } from "@/components/ui/button";
import Loading from "./loading";

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
function formatCampaignData(campaign: CampaignData) {
  // Format gallery images
  const galleryItems = campaign.media.map((item) => ({
    url: item.media_url,
    type: item.type as "image" | "video",
    id: item.id,
  }));

  // Format updates for display
  const formattedUpdates = campaign.updates.map((update) => ({
    id: update.id,
    title: update.title,
    message: update.content,
    createdAt: update.created_at,
    imageUrl: update.image_url,
    youtubeUrl: update.youtube_url,
  }));

  // Format comments
  const formattedComments = campaign.comments.map((comment) => ({
    donor: comment.profile.name,
    amount: 0, // We don't have amount in comments, would need to fetch from donations
    date: new Date(comment.created_at).toLocaleDateString(),
    comment: comment.message,
  }));

  const progressData = {
    isVerified: campaign.verification_status,
    createdAt: new Date(campaign.created_at).toLocaleDateString(),
    currentAmount: campaign.collected_amount,
    targetAmount: campaign.goal_amount,
    donorsCount: campaign.donor_count,
  };

  const organizerData = {
    name: campaign.organizer.name,
    role: "Organizador de campaña",
    location: campaign.organizer.location || campaign.location,
    memberSince: new Date(campaign.organizer.join_date)
      .getFullYear()
      .toString(),
    successfulCampaigns: campaign.organizer.active_campaigns_count,
    bio: campaign.organizer.bio || "Sin biografía",
  };

  return {
    title: campaign.title,
    description: campaign.description,
    beneficiaries: campaign.beneficiaries_description,
    images: galleryItems,
    progress: progressData,
    organizer: organizerData,
    comments: formattedComments,
    updates: formattedUpdates,
  };
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

// Fetch similar campaigns
async function fetchSimilarCampaigns(category: string, excludeId: string) {
  try {
    const supabase = createServerComponentClient({ cookies });

    const { data: campaigns } = await supabase
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
        donor_count,
        media:campaign_media(media_url, is_primary)
        `
      )
      .eq("category", category)
      .eq("campaign_status", "active")
      .neq("id", excludeId)
      .order("created_at", { ascending: false })
      .limit(3);

    return (
      campaigns?.map((campaign) => {
        // Find primary image
        const primaryImage = campaign.media?.find(
          (m: any) => m.is_primary
        )?.media_url;

        return {
          id: campaign.id,
          title: campaign.title,
          image: primaryImage || "/landing-page/dummies/Card/Imagen.png",
          category: formatCategory(campaign.category),
          location: campaign.location,
          progress: Math.min(
            Math.round(
              (campaign.collected_amount / campaign.goal_amount) * 100
            ),
            100
          ),
          description: campaign.description,
          donorCount: campaign.donor_count,
          amountRaised: `Bs. ${campaign.collected_amount.toFixed(2)}`,
        };
      }) || []
    );
  } catch (error) {
    console.error("Error fetching similar campaigns:", error);
    return [];
  }
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

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = createServerComponentClient({ cookies });
  const id = (await params).id;
  // Fetch campaign data with all related information
  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select(
      `
      *,
      organizer:profiles(*),
      media:campaign_media(*),
      updates:campaign_updates(*),
      comments(
        id,
        message,
        created_at,
        profile:profiles(id, name)
      )
      `
    )
    .eq("id", id)
    .eq("campaign_status", "active")
    .single();

  if (error || !campaign) {
    console.error("Error fetching campaign:", error);
    return notFound();
  }

  // Format campaign data for components
  const formattedCampaign = formatCampaignData(campaign);

  // Fetch similar campaigns
  const relatedCampaigns = await fetchSimilarCampaigns(
    campaign.category,
    campaign.id
  );

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
                  campaignId={id}
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
                  image={campaign.image}
                  category={campaign.category}
                  location={campaign.location}
                  progress={campaign.progress}
                  description={campaign.description}
                  donorCount={campaign.donorCount}
                  amountRaised={campaign.amountRaised}
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
