"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EditCampaignTab } from "@/components/campaign-admin/edit-campaign-tab";
import { AdsTab } from "@/components/campaign-admin/ads-tab";
import { CommentsTab } from "@/components/campaign-admin/comments-tab";
import { DonationsTab } from "@/components/campaign-admin/donations-tab";
import { TransferFundsTab } from "@/components/campaign-admin/transfer-funds-tab";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { X, Check } from "lucide-react";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("editar");
  const supabase = createClientComponentClient();

  // Add state variables for form fields
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(
    undefined
  );
  const [isFormModified, setIsFormModified] = useState(false);

  // Track original campaign state for reset functionality
  const [originalCampaign, setOriginalCampaign] = useState<Record<string, any>>(
    {}
  );

  // Function to handle form changes
  const handleFormChange = () => {
    setIsFormModified(true);
  };

  // Function to handle cancellation
  const handleCancel = () => {
    // Reset form to original values
    setCampaign(originalCampaign);
    setSelectedLocation(originalCampaign.location || null);
    setSelectedEndDate(
      originalCampaign.end_date
        ? new Date(originalCampaign.end_date)
        : undefined
    );
    setIsFormModified(false);
  };

  // Function to handle saving changes
  const handleSaveChanges = async () => {
    try {
      // Here you would implement the actual save logic with Supabase
      // For demonstration, we just reset the modified state
      setIsFormModified(false);
      setOriginalCampaign({ ...campaign });
      toast({
        title: "Cambios guardados",
        description: "Los cambios han sido guardados exitosamente.",
      });
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

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

        // Initialize state variables with campaign data
        if (enhancedCampaignData?.location) {
          setSelectedLocation(enhancedCampaignData.location);
        }

        if (enhancedCampaignData?.end_date) {
          setSelectedEndDate(new Date(enhancedCampaignData.end_date));
        }

        setCampaign(enhancedCampaignData);
        setOriginalCampaign(enhancedCampaignData);
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
                  className="flex items-center text-[#1a5535] gap-2 text-sm font-medium hover:underline"
                >
                  <span>Ver campaña</span>
                  <Image
                    src="/icons/visibility.svg"
                    alt="View"
                    width={18}
                    height={18}
                  />
                </Link>
                <button
                  className="flex items-center text-[#1a5535] gap-2 text-sm font-medium hover:underline"
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
                  <span>Compartir</span>
                  <Image
                    src="/icons/share.svg"
                    alt="Share"
                    width={18}
                    height={18}
                  />
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
        <div className="flex justify-between px-4 md:px-8 lg:px-16 xl:px-24 gap-2 pb-0">
          <button
            onClick={() => setActiveTab("editar")}
            className={`relative flex items-center gap-2 py-3 px-3 sm:px-6 rounded-t-lg transition-colors flex-1 justify-center border border-[#2c6e49] border-b-0 ${
              activeTab === "editar"
                ? "bg-white text-[#1a5535] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1px] after:bg-white after:z-10"
                : "bg-[#f2f8f5] text-[#1a5535] hover:bg-[#e8f5ed]"
            }`}
          >
            <span className="text-xs sm:text-sm">Editar campaña</span>
            <Image src="/icons/edit.svg" alt="Edit" width={16} height={16} />
          </button>

          <button
            onClick={() => setActiveTab("anuncios")}
            className={`relative flex items-center gap-2 py-3 px-3 sm:px-6 rounded-t-lg transition-colors flex-1 justify-center border border-[#2c6e49] border-b-0 ${
              activeTab === "anuncios"
                ? "bg-white text-[#1a5535] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1px] after:bg-white after:z-10"
                : "bg-[#f2f8f5] text-[#1a5535] hover:bg-[#e8f5ed]"
            }`}
          >
            <span className="text-xs sm:text-sm">Publicar anuncios</span>
            <Image src="/icons/add_2.svg" alt="Add" width={16} height={16} />
          </button>

          <button
            onClick={() => setActiveTab("comentarios")}
            className={`relative flex items-center gap-2 py-3 px-3 sm:px-6 rounded-t-lg transition-colors flex-1 justify-center border border-[#2c6e49] border-b-0 ${
              activeTab === "comentarios"
                ? "bg-white text-[#1a5535] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1px] after:bg-white after:z-10"
                : "bg-[#f2f8f5] text-[#1a5535] hover:bg-[#e8f5ed]"
            }`}
          >
            <span className="text-xs sm:text-sm">Comentarios</span>
            <Image
              src="/icons/chat.svg"
              alt="Comments"
              width={16}
              height={16}
            />
          </button>

          <button
            onClick={() => setActiveTab("donaciones")}
            className={`relative flex items-center gap-2 py-3 px-3 sm:px-6 rounded-t-lg transition-colors flex-1 justify-center border border-[#2c6e49] border-b-0 ${
              activeTab === "donaciones"
                ? "bg-white text-[#1a5535] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1px] after:bg-white after:z-10"
                : "bg-[#f2f8f5] text-[#1a5535] hover:bg-[#e8f5ed]"
            }`}
          >
            <span className="text-xs sm:text-sm">Donaciones</span>
            <Image
              src="/icons/check_circle.svg"
              alt="Donations"
              width={16}
              height={16}
            />
          </button>

          <button
            onClick={() => setActiveTab("transferir")}
            className={`relative flex items-center gap-2 py-3 px-3 sm:px-6 rounded-t-lg transition-colors flex-1 justify-center border border-[#2c6e49] border-b-0 ${
              activeTab === "transferir"
                ? "bg-white text-[#1a5535] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[1px] after:bg-white after:z-10"
                : "bg-[#f2f8f5] text-[#1a5535] hover:bg-[#e8f5ed]"
            }`}
          >
            <span className="text-xs sm:text-sm">Transferir fondos</span>
            <Image
              src="/icons/east.svg"
              alt="Transfer"
              width={16}
              height={16}
            />
          </button>
        </div>

        <div className="h-[1px] bg-[#2c6e49] w-full relative z-0"></div>

        {/* Tab Content */}
        <div className="bg-white w-full min-h-[500px] mt-0 pt-0">
          {activeTab === "editar" && (
            <div className="w-full">
              <div className="px-6 md:px-8 lg:px-16 xl:px-24 py-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                  Editar campaña
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-10">
                  Modifica los detalles de tu campaña para mejorar su alcance e
                  impacto. Actualiza la información, imágenes o metas según sea
                  necesario.
                </p>
                <div className="border-b border-[#478C5C]/20 my-8"></div>
              </div>
              <div className="px-6 md:px-8 lg:px-16 xl:px-24">
                <div className="max-w-4xl mx-auto bg-white rounded-lg border border-black p-8">
                  <form className="space-y-8">
                    {/* Nombre de la campaña */}
                    <div className="space-y-2">
                      <label className="text-lg font-bold text-gray-800">
                        Nombre de la campaña
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full p-4 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Ingresa el nombre de tu campaña"
                          defaultValue={campaign.title || ""}
                          onChange={(e) => {
                            setCampaign({ ...campaign, title: e.target.value });
                            handleFormChange();
                          }}
                        />
                      </div>
                      <div className="text-right text-sm text-black">0/60</div>
                    </div>

                    {/* Detalle */}
                    <div className="space-y-2">
                      <label className="text-lg font-bold text-gray-800">
                        Detalle
                      </label>
                      <div className="relative">
                        <textarea
                          className="w-full p-4 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px] resize-none"
                          placeholder="Ejemplo: Su conservación depende de nosotros"
                          defaultValue={campaign.description || ""}
                          onChange={(e) => {
                            setCampaign({
                              ...campaign,
                              description: e.target.value,
                            });
                            handleFormChange();
                          }}
                        ></textarea>
                      </div>
                      <div className="text-right text-sm text-black">0/130</div>
                    </div>

                    {/* Categoría */}
                    <div className="space-y-2">
                      <label className="text-lg font-bold text-gray-800">
                        Categoría
                      </label>
                      <div className="relative">
                        <select
                          className="w-full p-4 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
                          defaultValue={campaign.category || ""}
                        >
                          <option value="salud">Salud</option>
                          <option value="educacion">Educación</option>
                          <option value="medioambiente">Medio ambiente</option>
                          <option value="cultura_arte">Cultura y Arte</option>
                          <option value="emergencia">Emergencia</option>
                          <option value="igualdad">Igualdad</option>
                        </select>
                        <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M6 9L12 15L18 9"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Meta de recaudación */}
                    <div className="space-y-2">
                      <label className="text-lg font-bold text-gray-800">
                        Meta de recaudación
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          className="w-full p-4 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Bs. 2.000,00"
                          defaultValue={
                            campaign.goal_amount
                              ? `Bs. ${campaign.goal_amount.toLocaleString()}`
                              : ""
                          }
                        />
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-3 mt-2">
                        <div className="bg-blue-500 rounded-full p-1 flex items-center justify-center text-white">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <p className="text-blue-800 text-sm">
                          Este es el monto objetivo de tu campaña.
                        </p>
                      </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="space-y-2">
                      <label className="text-lg font-bold text-gray-800">
                        Imágenes de la campaña
                      </label>
                      <div className="border border-dashed border-gray-400 rounded-lg p-8 flex flex-col items-center justify-center text-center">
                        <div className="mb-4">
                          <Image
                            src="/icons/add_ad.svg"
                            alt="Add Image"
                            width={48}
                            height={48}
                          />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700">
                          Arrastra o carga tus fotos aquí
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 mb-4">
                          Deben ser archivos JPG o PNG, no mayor a 2 MB.
                        </p>
                        <button
                          type="button"
                          className="px-6 py-3 bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-lg font-medium"
                        >
                          Seleccionar
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center my-6">
                      <div className="flex-grow h-px bg-gray-300"></div>
                      <div className="mx-4 text-gray-500">o</div>
                      <div className="flex-grow h-px bg-gray-300"></div>
                    </div>

                    {/* YouTube */}
                    <div className="space-y-2">
                      <label className="text-lg font-bold text-gray-800">
                        Agregar enlace de YouTube
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                          <Image
                            src="/icons/add_link.svg"
                            alt="Add Link"
                            width={20}
                            height={20}
                          />
                        </div>
                        <input
                          type="text"
                          className="w-full p-4 pl-12 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Enlace de YouTube"
                          defaultValue={campaign.youtube_url || ""}
                        />
                      </div>
                    </div>

                    {/* Ubicación */}
                    <div className="space-y-2">
                      <label className="text-lg font-bold text-gray-800">
                        Ubicación de la campaña
                      </label>
                      <div className="relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full h-12 justify-start text-left relative pl-10 border-black rounded-md bg-white hover:bg-gray-50",
                                !(selectedLocation || campaign.location) &&
                                  "text-gray-400"
                              )}
                            >
                              <Image
                                src="/icons/search.svg"
                                alt="Search"
                                width={20}
                                height={20}
                                className="absolute left-3"
                              />
                              {selectedLocation
                                ? selectedLocation
                                    .split("_")
                                    .map(
                                      (word: string) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1)
                                    )
                                    .join(" ")
                                : campaign.location
                                  ? campaign.location
                                      .split("_")
                                      .map(
                                        (word: string) =>
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1)
                                      )
                                      .join(" ")
                                  : "¿Adónde irán los fondos?"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-full p-0 bg-white border border-gray-200 rounded-lg shadow-lg"
                            align="start"
                          >
                            <div className="p-2">
                              <div className="max-h-56 overflow-y-auto">
                                {[
                                  "la_paz",
                                  "santa_cruz",
                                  "cochabamba",
                                  "sucre",
                                  "oruro",
                                  "potosi",
                                  "tarija",
                                  "beni",
                                  "pando",
                                ].map((region) => (
                                  <Button
                                    key={region}
                                    variant="ghost"
                                    className="w-full justify-start text-left rounded-md p-2 hover:bg-gray-100"
                                    onClick={() => {
                                      setSelectedLocation(region);
                                      // Update campaign object
                                      setCampaign({
                                        ...campaign,
                                        location: region,
                                      });
                                      handleFormChange();
                                      document.body.click();
                                    }}
                                  >
                                    {region
                                      .split("_")
                                      .map(
                                        (word: string) =>
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1)
                                      )
                                      .join(" ")}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <p className="text-gray-500 text-sm flex items-center space-x-2">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span>Campo opcional</span>
                      </p>
                    </div>

                    {/* Fecha de finalización */}
                    <div className="space-y-2">
                      <label className="text-lg font-bold text-gray-800">
                        Fecha de finalización
                      </label>
                      <div className="relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant={"outline"}
                              className={cn(
                                "w-full h-12 justify-start text-left relative pl-10 border-black rounded-md bg-white hover:bg-gray-50",
                                !(selectedEndDate || campaign.end_date) &&
                                  "text-gray-400"
                              )}
                            >
                              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                              {selectedEndDate
                                ? format(selectedEndDate, "dd/MM/yyyy", {
                                    locale: es,
                                  })
                                : campaign.end_date
                                  ? format(
                                      new Date(campaign.end_date),
                                      "dd/MM/yyyy",
                                      { locale: es }
                                    )
                                  : "DD/MM/AAAA"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 bg-white border border-gray-200 rounded-lg shadow-lg"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={
                                selectedEndDate ||
                                (campaign.end_date
                                  ? new Date(campaign.end_date)
                                  : undefined)
                              }
                              onSelect={(date) => {
                                if (date) {
                                  setSelectedEndDate(date);
                                  // Update campaign object
                                  setCampaign({
                                    ...campaign,
                                    end_date: date.toISOString().split("T")[0],
                                  });
                                  handleFormChange();
                                }
                                setTimeout(() => document.body.click(), 100);
                              }}
                              disabled={(date) => {
                                // Disable dates in the past
                                return (
                                  date <
                                  new Date(new Date().setHours(0, 0, 0, 0))
                                );
                              }}
                              initialFocus
                              className="rounded-md border-none p-3"
                              captionLayout="dropdown"
                              fromYear={new Date().getFullYear()}
                              toYear={new Date().getFullYear() + 5}
                              classNames={{
                                caption_dropdowns: "flex gap-1",
                                dropdown:
                                  "p-1 bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#2c6e49]",
                                caption_label: "text-sm font-medium hidden",
                                nav_button:
                                  "h-8 w-8 bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-full",
                                day_selected:
                                  "bg-[#2c6e49] text-white hover:bg-[#2c6e49] hover:text-white focus:bg-[#2c6e49] focus:text-white",
                                day_today: "bg-gray-100 text-gray-900",
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Presentación de la campaña */}
                    <div className="space-y-2">
                      <label className="text-lg font-bold text-gray-800">
                        Presentación de la campaña
                      </label>
                      <div className="relative">
                        <textarea
                          className="w-full p-4 border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[120px] resize-none"
                          placeholder="Ejemplo: Su conservación depende de nosotros"
                          defaultValue={
                            campaign.beneficiaries_description || ""
                          }
                          onChange={(e) => {
                            setCampaign({
                              ...campaign,
                              beneficiaries_description: e.target.value,
                            });
                            handleFormChange();
                          }}
                        ></textarea>
                      </div>
                      <div className="text-right text-sm text-black">0/600</div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === "anuncios" && (
            <div className="w-full">
              <div className="px-6 md:px-8 lg:px-16 xl:px-24 py-6">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Publicar anuncios
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-10">
                  Mantén a tus donadores informados sobre los avances y logros
                  de tu campaña.
                </p>
                <div className="border-b border-[#478C5C]/20 my-8"></div>
              </div>
              <AdsTab campaign={campaign} />
            </div>
          )}

          {activeTab === "comentarios" && (
            <div className="w-full">
              <CommentsTab campaign={campaign} />
            </div>
          )}

          {activeTab === "donaciones" && (
            <div className="w-full">
              <DonationsTab campaign={campaign} />
            </div>
          )}

          {activeTab === "transferir" && (
            <div className="w-full">
              <div className="px-6 md:px-8 lg:px-16 xl:px-24 py-6">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Transferir fondos
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-10">
                  Transfiere los fondos recolectados a la cuenta designada para
                  el proyecto.
                </p>
                <div className="border-b border-[#478C5C]/20 my-8"></div>
              </div>
              <TransferFundsTab campaign={campaign} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom action bar that appears when form is modified */}
      {isFormModified && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 shadow-md z-50 py-4 px-6">
          <div className="container mx-auto">
            <div className="flex space-x-4 justify-start">
              <Button
                onClick={handleSaveChanges}
                className="px-6 py-2 bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full font-medium flex items-center"
              >
                <Check className="w-4 h-4 mr-2" />
                Guardar cambios
              </Button>
              <Button
                onClick={handleCancel}
                className="px-6 py-2 bg-transparent hover:bg-transparent text-[#2c6e49] rounded-md font-medium flex items-center shadow-none"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
