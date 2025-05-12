"use client";

import { Button } from "@/components/ui/button";
import { Check, Clock, Share2, Bookmark, BookmarkCheck } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSavedCampaigns } from "@/hooks/use-saved-campaigns";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";

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

  return (
    <div
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      id="campaign-progress"
    >
      <h2 className="text-xl font-semibold text-[#2c6e49] mb-1">
        Avances de la campaña
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Cada aporte cuenta. ¡Sé parte del cambio!
      </p>

      <div className="flex items-center gap-6 mb-4">
        {isVerified && (
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#2c6e49]" />
            <span className="text-sm">Campaña verificada</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm">Creada hace {createdAt}</span>
        </div>
      </div>

      {/* First separator */}
      <hr className="h-px w-full bg-gray-200 my-4" />

      <div className="space-y-4 mb-4">
        <div className="flex justify-between text-sm">
          <span>Recaudado Bs. {(currentAmount || 0).toLocaleString()}</span>
          <span>{donorsCount || 0} donadores</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2c6e49] rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span>Objetivo de recaudación</span>
          <span>Bs. {(targetAmount || 0).toLocaleString()}</span>
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
        <Button
          variant="outline"
          className="w-full border-gray-200 hover:bg-gray-50 rounded-full py-6"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Compartir
        </Button>
        <Button
          variant="ghost"
          className="w-full hover:bg-gray-50 rounded-full py-6"
          onClick={handleSaveToggle}
          disabled={isSaving || authLoading}
        >
          {isSaved ? (
            <BookmarkCheck className="mr-2 h-4 w-4 text-[#2c6e49]" />
          ) : (
            <Bookmark className="mr-2 h-4 w-4" />
          )}
          {isSaved ? "Campaña guardada" : "Guardar campaña"}
          {authLoading && " (cargando...)"}
        </Button>
      </div>
    </div>
  );
}
