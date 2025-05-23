"use client";

import { Button } from "@/components/ui/button";
import {
  Check,
  Clock,
  Share2,
  Bookmark,
  BookmarkCheck,
  Copy,
  Facebook,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSavedCampaigns } from "@/hooks/use-saved-campaigns";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CampaignProgressProps {
  isVerified: boolean;
  createdAt: string;
  currentAmount: number;
  targetAmount: number;
  donorsCount: number;
  campaignTitle?: string;
  campaignOrganizer?: string;
  campaignLocation?: string;
  campaignId?: string;
}

// Function to calculate relative time
function getRelativeTime(dateString: string): string {
  const now = new Date();
  const createdDate = new Date(dateString);
  const diffTime = Math.abs(now.getTime() - createdDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "hoy";
  } else if (diffDays === 1) {
    return "1 día";
  } else if (diffDays < 30) {
    return `${diffDays} días`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "1 mes" : `${months} meses`;
  } else {
    const years = Math.floor(diffDays / 365);
    return years === 1 ? "1 año" : `${years} años`;
  }
}

export function CampaignProgress({
  isVerified,
  createdAt,
  currentAmount,
  targetAmount,
  donorsCount,
  campaignTitle = "",
  campaignOrganizer = "",
  campaignLocation = "",
  campaignId = "",
}: CampaignProgressProps) {
  const { session, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { isCampaignSaved, saveCampaign, unsaveCampaign } = useSavedCampaigns();
  const [isSaving, setIsSaving] = useState(false);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const router = useRouter();

  const isLoggedIn = !!session;
  console.log(session);
  const isSaved = isCampaignSaved(campaignId);

  // Debug session state
  useEffect(() => {
    if (!authLoading) {
      setIsSessionLoaded(true);
      console.log("Session state:", {
        isLoggedIn,
        hasSession: !!session,
        email: session?.user?.email,
      });
    }
  }, [session, authLoading, isLoggedIn]);

  const safeCurrentAmount = currentAmount || 0;
  const safeTargetAmount = targetAmount || 1;
  const progress =
    safeTargetAmount > 0
      ? Math.min((safeCurrentAmount / safeTargetAmount) * 100, 100)
      : 0;

  const handleSaveToggle = async () => {
    // Don't proceed until auth is confirmed loaded
    if (authLoading) {
      toast({
        title: "Cargando",
        description: "Por favor espera mientras verificamos tu sesión",
      });
      return;
    }

    if (!isLoggedIn) {
      console.log("User not logged in, session:", session);
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar campañas",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        const result = await unsaveCampaign(campaignId);
        console.log("Unsave result:", result);
      } else {
        const result = await saveCampaign(campaignId);
        console.log("Save result:", result);
      }
    } catch (error) {
      console.error("Error toggling saved state:", error);
      toast({
        title: "Error",
        description: "No se pudo completar la operación",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareClick = () => {
    const shareUrl = `${window.location.origin}/campaign/${campaignId}`;
    const shareTitle = campaignTitle || "Apoya esta campaña";
    const shareText = `¡Apoya esta campaña en Minka! ${shareTitle}`;

    // Try to use native Web Share API if available (mobile devices)
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      navigator
        .share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
        .catch((error) => {
          console.log("Error sharing:", error);
          // Fallback to custom share options
          setShowShareOptions(true);
        });
    } else {
      // Show custom share options for desktop
      setShowShareOptions(true);
    }
  };

  const shareOnPlatform = (platform: string) => {
    const shareUrl = `${window.location.origin}/campaign/${campaignId}`;
    const shareTitle = campaignTitle || "Apoya esta campaña";
    const shareText = `¡Apoya esta campaña en Minka! ${shareTitle}`;

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    };

    if (platform === "copy") {
      copyToClipboard(shareUrl);
    } else if (urls[platform as keyof typeof urls]) {
      window.open(
        urls[platform as keyof typeof urls],
        "_blank",
        "width=600,height=400"
      );
      setShowShareOptions(false);
      toast({
        title: "¡Compartiendo!",
        description: `Se abrió ${platform} para compartir la campaña`,
      });
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setShowShareOptions(false);
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace de la campaña ha sido copiado al portapapeles",
      });
    } catch (error) {
      console.error("Failed to copy: ", error);
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm relative"
      id="campaign-progress"
    >
      {/* Centered title - increased size */}
      <h2 className="text-2xl font-semibold text-[#2c6e49] mb-1 text-center">
        Avances de la campaña
      </h2>
      {/* Green subtitle - increased size */}
      <p className="text-base text-[#2c6e49] mb-4 text-center">
        Cada aporte cuenta. ¡Sé parte del cambio!
      </p>

      {/* Verified and Created Date - Left and Right aligned */}
      <div className="flex justify-between items-center mb-4">
        {isVerified && (
          <div className="flex items-center gap-2">
            <Image
              src="/icons/verified.svg"
              alt="Verified"
              width={24}
              height={24}
            />
            <span className="text-sm">Campaña verificada</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Image
            src="/icons/schedule.svg"
            alt="Schedule"
            width={24}
            height={24}
          />
          <span className="text-sm">
            Creada hace {getRelativeTime(createdAt)}
          </span>
        </div>
      </div>

      {/* First separator */}
      <hr className="h-px w-full bg-gray-200 my-4" />

      <div className="space-y-4 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-[#2c6e49] font-medium">
            Recaudado Bs. {(currentAmount || 0).toLocaleString()}
          </span>
          <span className="text-[#2c6e49] font-medium">
            {donorsCount || 0} donadores
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2c6e49] rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-lg font-bold text-[#2c6e49] min-w-[60px]">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#2c6e49] font-medium">
            Objetivo de recaudación
          </span>
          <span className="text-[#2c6e49] font-medium">
            Bs. {(targetAmount || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Second separator */}
      <hr className="h-px w-full bg-gray-200 my-4" />

      <div className="space-y-3">
        <Link href={`/donate/${campaignId}`}>
          <Button className="w-full bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full py-6">
            Donar ahora
          </Button>
        </Link>

        {/* Share Button with Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            className="w-full border-[#2c6e49] hover:bg-gray-50 rounded-full py-6 text-[#2c6e49]"
            onClick={handleShareClick}
          >
            Compartir
            <Share2 className="ml-2 h-4 w-4" />
          </Button>

          {/* Share Options Dropdown */}
          {showShareOptions && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 z-10">
              <div className="text-sm font-medium text-gray-700 mb-3 text-center">
                Compartir en:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => shareOnPlatform("whatsapp")}
                  className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <Image
                    src="/social-media/whatsapp.svg"
                    alt="WhatsApp"
                    width={20}
                    height={20}
                  />
                  <span className="text-sm">WhatsApp</span>
                </button>

                <button
                  onClick={() => shareOnPlatform("facebook")}
                  className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <Image
                    src="/social-media/facebook.svg"
                    alt="Facebook"
                    width={20}
                    height={20}
                  />
                  <span className="text-sm">Facebook</span>
                </button>

                <button
                  onClick={() => shareOnPlatform("twitter")}
                  className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <Image
                    src="/social-media/X.svg"
                    alt="X (Twitter)"
                    width={20}
                    height={20}
                  />
                  <span className="text-sm">X (Twitter)</span>
                </button>

                <button
                  onClick={() => shareOnPlatform("linkedin")}
                  className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <Image
                    src="/icons/LinkedIN_white.svg"
                    alt="LinkedIn"
                    width={20}
                    height={20}
                    style={{ filter: "brightness(0.43)" }}
                  />
                  <span className="text-sm">LinkedIn</span>
                </button>

                <button
                  onClick={() => shareOnPlatform("copy")}
                  className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-colors col-span-2"
                >
                  <Copy className="h-5 w-5 text-gray-600" />
                  <span className="text-sm">Copiar enlace</span>
                </button>
              </div>

              <button
                onClick={() => setShowShareOptions(false)}
                className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          className="w-full hover:bg-gray-50 rounded-full py-6 text-[#2c6e49]"
          onClick={handleSaveToggle}
          disabled={isSaving || authLoading}
        >
          {isSaved ? "Campaña guardada" : "Guardar campaña"}
          {authLoading && " (cargando...)"}
          {isSaved ? (
            <BookmarkCheck className="ml-2 h-4 w-4 text-[#2c6e49]" />
          ) : (
            <Bookmark className="ml-2 h-4 w-4 text-[#2c6e49]" />
          )}
        </Button>
      </div>

      {/* Click outside to close share options */}
      {showShareOptions && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowShareOptions(false)}
        />
      )}
    </div>
  );
}
