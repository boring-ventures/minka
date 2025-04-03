"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Pencil, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EditCampaignTab } from "@/components/campaign-admin/edit-campaign-tab";
import { AdsTab } from "@/components/campaign-admin/ads-tab";
import { CommentsTab } from "@/components/campaign-admin/comments-tab";
import { DonationsTab } from "@/components/campaign-admin/donations-tab";
import { TransferFundsTab } from "@/components/campaign-admin/transfer-funds-tab";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("editar");
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function getCampaignDetails() {
      try {
        const { data: session } = await supabase.auth.getSession();

        if (!session.session) {
          router.push("/sign-in");
          return;
        }

        // Fetch campaign details with media
        const { data: campaignData, error } = await supabase
          .from("campaigns")
          .select(
            `
            *,
            organizer:profiles(*),
            media:campaign_media(*)
          `
          )
          .eq("id", params.id)
          .single();

        if (error || !campaignData) {
          // In development mode, use dummy data instead of showing error or redirecting
          if (process.env.NODE_ENV === "development") {
            console.log("Using dummy campaign data for development");
            setCampaign({
              id: params.id,
              title: "Protejamos juntos el parque Nacional Amboró",
              description:
                "Una campaña para proteger la biodiversidad del parque nacional Amboró, uno de los tesoros naturales de Bolivia.",
              location: "Bolivia, Santa Cruz",
              image_url: "/amboro-main.jpg",
              collected_amount: 4000,
              goal_amount: 10000,
              donor_count: 250,
              days_remaining: 4,
              category: "medioambiente",
              organizer_id: session.session.user.id,
              media: [],
              youtube_url: "",
              end_date: "2024-12-31",
              beneficiaries_description:
                "Comunidades locales y vida silvestre del parque Amboró",
            });
            setLoading(false);
            return;
          }

          console.error("Error fetching campaign:", error);
          router.push("/dashboard/campaigns");
          return;
        }

        // Check if user is the campaign organizer
        if (campaignData.organizer_id !== session.session.user.id) {
          // Check if user is admin
          const { data: profileData } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.session.user.id)
            .single();

          if (!profileData || profileData.role !== "admin") {
            router.push("/dashboard/campaigns");
            return;
          }
        }

        // Find the primary image from campaign media
        const primaryMedia = campaignData.media?.find(
          (media: any) =>
            media.is_primary && media.media_url && media.media_url.trim() !== ""
        );

        // Merge campaign data with the primary image URL
        const enhancedCampaignData = {
          ...campaignData,
          image_url:
            primaryMedia?.media_url && primaryMedia.media_url.trim() !== ""
              ? primaryMedia.media_url
              : "/amboro-main.jpg",
          category_id: campaignData.categories?.id || "",
        };

        setCampaign(enhancedCampaignData);
      } catch (error) {
        // Suppress errors in development mode with dummy data
        if (process.env.NODE_ENV === "development") {
          console.log(
            "Error encountered, using dummy campaign data for development"
          );
          const { data: session } = await supabase.auth.getSession();

          setCampaign({
            id: params.id,
            title: "Protejamos juntos el parque Nacional Amboró",
            description:
              "Una campaña para proteger la biodiversidad del parque nacional Amboró, uno de los tesoros naturales de Bolivia.",
            location: "Bolivia, Santa Cruz",
            image_url: "/amboro-main.jpg",
            collected_amount: 4000,
            goal_amount: 10000,
            donor_count: 250,
            days_remaining: 4,
            category: "medioambiente",
            organizer_id: session?.session?.user?.id || "dummy-id",
            media: [],
            youtube_url: "",
            end_date: "2024-12-31",
            beneficiaries_description:
              "Comunidades locales y vida silvestre del parque Amboró",
          });
        } else {
          console.error("Error:", error);
          router.push("/dashboard/campaigns");
        }
      } finally {
        setLoading(false);
      }
    }

    getCampaignDetails();
  }, [params.id, router, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold">Campaña no encontrada</h1>
        <p className="mt-4">
          La campaña que buscas no existe o no tienes permisos para verla.
        </p>
        <Button
          className="mt-8 bg-[#2c6e49] hover:bg-[#1e4d33] text-white"
          onClick={() => router.push("/dashboard/campaigns")}
        >
          Volver a mis campañas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Campaign Header */}
      <div className="px-6 md:px-8 lg:px-16 xl:px-24">
        <div className="rounded-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Campaign Image */}
            <div className="relative w-full md:w-[350px] h-56">
              <Image
                src={campaign.image_url || "/amboro-main.jpg"}
                alt={campaign.title || "Campaign image"}
                fill
                className="object-cover rounded-lg"
              />
            </div>

            {/* Campaign Details */}
            <div className="p-4 md:p-6 flex-1 flex flex-col">
              {/* Action Buttons */}
              <div className="flex space-x-5 mb-5">
                <Link
                  href={`/campaign/${params.id}`}
                  className="flex items-center text-[#2c6e49] gap-2 text-sm font-medium hover:underline"
                >
                  <Eye className="h-4 w-4" />
                  <span>Ver campaña</span>
                </Link>
                <button
                  className="flex items-center text-[#2c6e49] gap-2 text-sm font-medium hover:underline"
                  onClick={() => {
                    // Create the URL to share
                    const shareUrl = `${window.location.origin}/campaign/${params.id}`;

                    // Try to use the Web Share API if available
                    if (navigator.share) {
                      navigator
                        .share({
                          title: campaign.title,
                          text: campaign.description?.substring(0, 100) + "...",
                          url: shareUrl,
                        })
                        .catch(() => {
                          // Fallback to clipboard if sharing fails
                          navigator.clipboard.writeText(shareUrl).then(() => {
                            toast({
                              title: "Enlace copiado",
                              description:
                                "El enlace ha sido copiado al portapapeles.",
                            });
                          });
                        });
                    } else {
                      // Fallback for browsers that don't support sharing
                      navigator.clipboard
                        .writeText(shareUrl)
                        .then(() => {
                          toast({
                            title: "Enlace copiado",
                            description:
                              "El enlace ha sido copiado al portapapeles.",
                          });
                        })
                        .catch(() => {
                          // Silent fail - don't show errors to user
                          toast({
                            title: "Enlace copiado",
                            description:
                              "El enlace ha sido copiado al portapapeles.",
                          });
                        });
                    }
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-[#2c6e49]"
                  >
                    <path
                      d="M7.21701 10.907C6.97487 10.9208 6.73815 10.9937 6.52333 11.1206C6.30851 11.2475 6.12126 11.4254 5.97708 11.6391C5.8329 11.8528 5.73559 12.0973 5.69335 12.3544C5.65111 12.6114 5.66505 12.8741 5.73401 13.125C5.87401 13.705 6.33901 14.484 7.12601 15.278C7.91301 16.072 8.69201 16.537 9.27201 16.677C9.52255 16.7458 9.78475 16.7598 10.0414 16.7177C10.298 16.6756 10.5423 16.5785 10.7558 16.4347C10.9693 16.2908 11.1472 16.104 11.2742 15.8895C11.4013 15.6751 11.4745 15.4387 11.4886 15.197C11.4992 15.003 11.4753 14.8091 11.4181 14.6242C11.3609 14.4393 11.2718 14.2669 11.155 14.117C11.0853 14.0343 11.0302 13.9415 10.9922 13.842C11.112 13.755 11.224 13.658 11.325 13.558C11.436 13.455 11.549 13.348 11.662 13.241C11.8006 13.316 11.9502 13.3655 12.104 13.387C12.2217 13.4139 12.3422 13.4275 12.463 13.428C12.735 13.428 13.0035 13.3554 13.242 13.218C13.4805 13.0807 13.6807 12.8833 13.8212 12.6466C13.9617 12.4098 14.038 12.1423 14.0414 11.8701C14.0448 11.5979 13.9751 11.3287 13.8407 11.0887C13.7063 10.8487 13.5111 10.6466 13.2762 10.5037C13.0413 10.3608 12.7747 10.2818 12.5025 10.2739C12.2304 10.2661 11.9597 10.3296 11.717 10.4584C11.4743 10.5872 11.2682 10.7774 11.12 11.009C11.0352 11.1493 10.9748 11.3025 10.9411 11.462C10.835 11.4 10.731 11.342 10.629 11.29C10.5483 11.2476 10.4657 11.208 10.382 11.171C10.4283 11.0614 10.4608 10.9463 10.478 10.828C10.5091 10.6253 10.494 10.4184 10.4338 10.221C10.3736 10.0236 10.2696 9.84024 10.129 9.68302C9.98838 9.52581 9.81469 9.39877 9.61999 9.31104C9.42528 9.22331 9.21409 9.17701 9.00001 9.17504C8.78593 9.17307 8.57386 9.21548 8.37746 9.2997C8.18106 9.38392 8.0049 9.50785 7.86104 9.66258C7.71718 9.8173 7.60923 9.99884 7.54494 10.1953C7.48064 10.3918 7.46134 10.5987 7.48901 10.802C7.51134 10.8716 7.52835 10.9426 7.54001 11.015C7.23318 10.9333 6.91631 10.9021 6.60101 10.923C6.12001 10.866 7.21701 10.907 7.21701 10.907Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 5L12 14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.5 18.5L3 14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 12V18.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8.5 9.5V18.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Compartir</span>
                </button>
              </div>

              {/* Campaign Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                {campaign.title}
              </h1>

              {/* Campaign Stats */}
              <div className="flex flex-wrap items-center">
                <div className="text-sm">
                  <p className="font-medium text-gray-800">
                    Bs. {campaign.collected_amount?.toLocaleString() || "0"}{" "}
                    recaudados
                  </p>
                </div>
                <div className="mx-6 w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="text-sm">
                  <p className="font-medium text-gray-800">
                    {campaign.donor_count || "0"} donadores
                  </p>
                </div>
                <div className="mx-6 w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="text-sm">
                  <p className="font-medium text-gray-800">
                    Quedan {campaign.days_remaining || "0"} días
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full">
        {/* Custom Tab Navigation */}
        <div className="flex flex-wrap px-6 md:px-8 lg:px-16 xl:px-24 gap-2">
          <button
            onClick={() => setActiveTab("editar")}
            className={`flex items-center gap-2 py-2 px-6 rounded-t-lg transition-colors min-w-[150px] justify-center ${
              activeTab === "editar"
                ? "bg-white text-[#2c6e49] border-t border-l border-r border-[#2c6e49]"
                : "bg-[#f2f8f5] text-[#2c6e49] hover:bg-[#e8f5ed]"
            }`}
          >
            <Pencil className="h-4 w-4" />
            <span className="text-sm">Editar campaña</span>
          </button>

          <button
            onClick={() => setActiveTab("anuncios")}
            className={`flex items-center gap-2 py-2 px-6 rounded-t-lg transition-colors min-w-[150px] justify-center ${
              activeTab === "anuncios"
                ? "bg-white text-[#2c6e49] border-t border-l border-r border-[#2c6e49]"
                : "bg-[#f2f8f5] text-[#2c6e49] hover:bg-[#e8f5ed]"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#2c6e49]"
            >
              <path
                d="M12 4V20M4 12H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm">Publicar anuncios</span>
          </button>

          <button
            onClick={() => setActiveTab("comentarios")}
            className={`flex items-center gap-2 py-2 px-6 rounded-t-lg transition-colors min-w-[150px] justify-center ${
              activeTab === "comentarios"
                ? "bg-white text-[#2c6e49] border-t border-l border-r border-[#2c6e49]"
                : "bg-[#f2f8f5] text-[#2c6e49] hover:bg-[#e8f5ed]"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#2c6e49]"
            >
              <path
                d="M8 12H16M8 8H13M3 20.29V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 20.29Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm">Comentarios</span>
          </button>

          <button
            onClick={() => setActiveTab("donaciones")}
            className={`flex items-center gap-2 py-2 px-6 rounded-t-lg transition-colors min-w-[150px] justify-center ${
              activeTab === "donaciones"
                ? "bg-white text-[#2c6e49] border-t border-l border-r border-[#2c6e49]"
                : "bg-[#f2f8f5] text-[#2c6e49] hover:bg-[#e8f5ed]"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#2c6e49]"
            >
              <path
                d="M19 14C20.49 12.54 20.5 10.5 19 9C17.5 7.5 14.5 7.5 13 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.5 11.5C15.5 10 17 9 18.5 9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.5 19H21"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11 19C13.2091 19 15 17.2091 15 15C15 12.7909 13.2091 11 11 11C8.79086 11 7 12.7909 7 15C7 17.2091 8.79086 19 11 19Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7 11L7 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 11L11 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm">Donaciones</span>
          </button>

          <button
            onClick={() => setActiveTab("transferir")}
            className={`flex items-center gap-2 py-2 px-6 rounded-t-lg transition-colors min-w-[150px] justify-center ${
              activeTab === "transferir"
                ? "bg-white text-[#2c6e49] border-t border-l border-r border-[#2c6e49]"
                : "bg-[#f2f8f5] text-[#2c6e49] hover:bg-[#e8f5ed]"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#2c6e49]"
            >
              <path
                d="M5 12H19M19 12L13 6M19 12L13 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm">Transferir fondos</span>
          </button>
        </div>

        <div className="h-[1px] bg-[#2c6e49] w-full"></div>

        {/* Tab Content */}
        <div className="bg-white w-full min-h-[500px]">
          <div className="px-6 md:px-8 lg:px-16 xl:px-24 py-6">
            {activeTab === "editar" && (
              <div className="space-y-12 max-w-6xl mx-auto">
                <div className="py-8">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    Editar campaña
                  </h2>
                  <p className="text-xl text-gray-600 leading-relaxed mb-10">
                    Modifica los detalles de tu campaña para mejorar su alcance
                    e impacto. Actualiza la información, imágenes o metas según
                    sea necesario.
                  </p>
                  <div className="border-b border-[#478C5C]/20 my-8"></div>
                </div>
                <EditCampaignTab campaign={campaign} />
              </div>
            )}
            {activeTab === "anuncios" && <AdsTab campaign={campaign} />}
            {activeTab === "comentarios" && (
              <div className="space-y-12 max-w-6xl mx-auto">
                <div className="py-8">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    Comentarios
                  </h2>
                  <p className="text-xl text-gray-600 leading-relaxed mb-10">
                    Revisa y responde a los comentarios de tus donadores para
                    mantener una comunicación activa.
                  </p>
                  <div className="border-b border-[#478C5C]/20 my-8"></div>
                </div>
                <CommentsTab campaign={campaign} />
              </div>
            )}
            {activeTab === "donaciones" && (
              <div className="space-y-12 max-w-6xl mx-auto">
                <div className="py-8">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    Donaciones
                  </h2>
                  <p className="text-xl text-gray-600 leading-relaxed mb-10">
                    Monitorea las donaciones recibidas y agradece a tus
                    donadores por su apoyo.
                  </p>
                  <div className="border-b border-[#478C5C]/20 my-8"></div>
                </div>
                <DonationsTab campaign={campaign} />
              </div>
            )}
            {activeTab === "transferir" && (
              <div className="space-y-12 max-w-6xl mx-auto">
                <div className="py-8">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    Transferir fondos
                  </h2>
                  <p className="text-xl text-gray-600 leading-relaxed mb-10">
                    Transfiere los fondos recolectados a la cuenta designada
                    para el proyecto.
                  </p>
                  <div className="border-b border-[#478C5C]/20 my-8"></div>
                </div>
                <TransferFundsTab campaign={campaign} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
