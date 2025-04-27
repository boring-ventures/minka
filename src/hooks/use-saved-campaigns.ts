import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/components/ui/use-toast";

type SavedCampaign = {
  id: string;
  savedId: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  location: string;
  createdAt: string;
};

export function useSavedCampaigns() {
  const [savedCampaigns, setSavedCampaigns] = useState<SavedCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { session, loading: authLoading } = useAuth();

  // Function to fetch saved campaigns
  const fetchSavedCampaigns = useCallback(async () => {
    if (authLoading) {
      // Still loading auth state, don't fetch yet
      return;
    }

    if (!session) {
      setSavedCampaigns([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("Fetching saved campaigns for session:", !!session);
      const response = await fetch("/api/saved-campaign", {
        credentials: "include", // Important to include cookies
        headers: {
          "Cache-Control": "no-cache", // Prevent caching issues
        },
      });

      console.log("Fetch response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch saved campaigns");
      }

      const data = await response.json();
      console.log(`Fetched ${data.length} saved campaigns`);
      setSavedCampaigns(data);
    } catch (err) {
      console.error("Error fetching saved campaigns:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, [session, authLoading]);

  // Fetch saved campaigns on mount and when session changes
  useEffect(() => {
    if (!authLoading) {
      // Only fetch if auth loading is complete
      fetchSavedCampaigns();
    }
  }, [fetchSavedCampaigns, authLoading]);

  // Function to save a campaign
  const saveCampaign = async (campaignId: string) => {
    if (authLoading) {
      toast({
        title: "Cargando",
        description: "Por favor espera mientras verificamos tu sesión",
      });
      return false;
    }

    if (!session) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para guardar campañas",
        variant: "destructive",
      });
      return false;
    }

    try {
      setError(null);
      console.log("Saving campaign:", campaignId);

      const response = await fetch("/api/saved-campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        credentials: "include", // Include cookies for auth
        body: JSON.stringify({ campaignId }),
      });

      console.log("Save response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save campaign");
      }

      const data = await response.json();
      console.log("Save response:", data);

      // Refresh the list of saved campaigns
      await fetchSavedCampaigns();

      toast({
        title: "Campaña guardada",
        description: "La campaña ha sido guardada exitosamente",
      });

      return true;
    } catch (err) {
      console.error("Error saving campaign:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );

      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "No se pudo guardar la campaña",
        variant: "destructive",
      });

      return false;
    }
  };

  // Function to unsave a campaign
  const unsaveCampaign = async (campaignId: string) => {
    if (authLoading) {
      toast({
        title: "Cargando",
        description: "Por favor espera mientras verificamos tu sesión",
      });
      return false;
    }

    if (!session) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para eliminar campañas guardadas",
        variant: "destructive",
      });
      return false;
    }

    try {
      setError(null);
      console.log("Unsaving campaign:", campaignId);

      const response = await fetch("/api/saved-campaign", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        credentials: "include", // Include cookies for auth
        body: JSON.stringify({ campaignId }),
      });

      console.log("Unsave response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to unsave campaign");
      }

      // Refresh the list of saved campaigns
      await fetchSavedCampaigns();

      toast({
        title: "Campaña eliminada",
        description: "La campaña ha sido eliminada de tu lista",
      });

      return true;
    } catch (err) {
      console.error("Error unsaving campaign:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );

      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "No se pudo eliminar la campaña",
        variant: "destructive",
      });

      return false;
    }
  };

  // Function to check if a campaign is saved
  const isCampaignSaved = useCallback(
    (campaignId: string) => {
      return savedCampaigns.some((campaign) => campaign.id === campaignId);
    },
    [savedCampaigns]
  );

  return {
    savedCampaigns,
    isLoading,
    error,
    saveCampaign,
    unsaveCampaign,
    isCampaignSaved,
    refresh: fetchSavedCampaigns,
  };
}
