"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Award } from "lucide-react";

import { useCampaign } from "@/hooks/useCampaign";
import { CampaignGallery } from "@/components/views/campaign/CampaignGallery";
import { CampaignProgress } from "@/components/views/campaign/CampaignProgress";
import { StickyProgressWrapper } from "@/components/views/campaign/StickyProgressWrapper";
import { Header } from "@/components/views/landing-page/Header";
import { Footer } from "@/components/views/landing-page/Footer";
import { CampaignCard } from "@/components/views/campaigns/CampaignCard";
import { CampaignUpdates } from "@/components/views/campaign/CampaignUpdates";
import Loading from "@/app/campaign/[id]/loading";

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

// Async function to fetch related campaigns
async function fetchRelatedCampaigns(category: string, id: string) {
  try {
    console.log(
      `Client: Fetching related campaigns for category ${category} excluding ${id}`
    );
    const response = await fetch(
      `/api/campaign/related?category=${category}&excludeId=${id}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch related campaigns");
    }
    return await response.json();
  } catch (error) {
    console.error("Client: Error fetching related campaigns:", error);
    return { campaigns: [] };
  }
}

export default function CampaignClientPage({ id }: { id: string }) {
  const { campaign, isLoading, error } = useCampaign(id);
  const [relatedCampaigns, setRelatedCampaigns] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("descripcion");

  useEffect(() => {
    if (campaign?.category) {
      fetchRelatedCampaigns(campaign.category, id)
        .then(setRelatedCampaigns)
        .catch((err) =>
          console.error("Error fetching related campaigns:", err)
        );
    }
  }, [campaign, id]);

  // Handle error state
  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl text-red-600 mb-2">Error</h2>
            <p className="text-gray-700">{error}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Handle loading state
  if (isLoading || !campaign) {
    return <Loading />;
  }

  // Format campaign data for components
  const formattedData = formatCampaignData(campaign);

  return (
    <>
      <Header />
      <div className="h-20 md:h-28"></div>
      <main className="container mx-auto px-4 py-10">
        {/* Campaign Title */}
        <h1 className="text-3xl md:text-5xl font-bold text-[#2c6e49] mb-6">
          {campaign.title}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {/* Campaign Gallery */}
            <CampaignGallery images={formattedData.images} />

            {/* Tabs for mobile view */}
            <div className="mt-8 lg:hidden">
              <StickyProgressWrapper>
                <CampaignProgress
                  currentAmount={formattedData.progress.currentAmount}
                  targetAmount={formattedData.progress.targetAmount}
                  donorsCount={formattedData.progress.donorsCount}
                  isVerified={formattedData.progress.isVerified}
                  createdAt={formattedData.progress.createdAt}
                />
              </StickyProgressWrapper>
            </div>

            {/* Tab Navigation */}
            <div className="mt-10 border-b border-gray-200">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab("descripcion")}
                  className={`pb-4 px-2 font-medium ${
                    activeTab === "descripcion"
                      ? "text-[#2c6e49] border-b-2 border-[#2c6e49]"
                      : "text-gray-500"
                  }`}
                >
                  Descripción
                </button>
                <button
                  onClick={() => setActiveTab("actualizaciones")}
                  className={`pb-4 px-2 font-medium ${
                    activeTab === "actualizaciones"
                      ? "text-[#2c6e49] border-b-2 border-[#2c6e49]"
                      : "text-gray-500"
                  }`}
                >
                  Actualizaciones
                </button>
                <button
                  onClick={() => setActiveTab("comentarios")}
                  className={`pb-4 px-2 font-medium ${
                    activeTab === "comentarios"
                      ? "text-[#2c6e49] border-b-2 border-[#2c6e49]"
                      : "text-gray-500"
                  }`}
                >
                  Comentarios
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="my-8">
              {activeTab === "descripcion" && (
                <CustomCampaignDetails
                  organizer={formattedData.organizer}
                  description={formattedData.description}
                  beneficiaries={formattedData.beneficiaries}
                />
              )}

              {activeTab === "actualizaciones" && (
                <CampaignUpdates updates={formattedData.updates} />
              )}

              {activeTab === "comentarios" && (
                <CustomDonorComments comments={formattedData.comments} />
              )}
            </div>
          </div>

          {/* Right Sidebar - Sticky on desktop */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-32">
              <CampaignProgress
                currentAmount={formattedData.progress.currentAmount}
                targetAmount={formattedData.progress.targetAmount}
                donorsCount={formattedData.progress.donorsCount}
                isVerified={formattedData.progress.isVerified}
                createdAt={formattedData.progress.createdAt}
              />
            </div>
          </div>
        </div>

        {/* Related Campaigns */}
        {relatedCampaigns.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-[#2c6e49]">
                Causas similares
              </h2>
              <Link
                href="/campaigns"
                className="flex items-center text-[#2c6e49] font-medium"
              >
                Ver todas <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  id={campaign.id}
                  title={campaign.title}
                  image={campaign.primaryImage || ""}
                  category={campaign.category}
                  location={campaign.location as any}
                  progress={campaign.percentageFunded}
                  verified={campaign.verified}
                  description={campaign.description}
                  donorCount={campaign.donorCount}
                  amountRaised={`Bs. ${campaign.collectedAmount.toLocaleString("es-BO")}`}
                />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
