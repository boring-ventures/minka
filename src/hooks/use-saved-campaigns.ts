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
  const { session } = useAuth();

  // Function to fetch saved campaigns
  const fetchSavedCampaigns = useCallback(async () => {
    if (!session) {
      setSavedCampaigns([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/saved-campaign");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch saved campaigns");
      }

      const data = await response.json();
      setSavedCampaigns(data);
    } catch (err) {
      console.error("Error fetching saved campaigns:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Fetch saved campaigns on mount and when session changes
  useEffect(() => {
    fetchSavedCampaigns();
  }, [fetchSavedCampaigns]);

  // Function to save a campaign
  const saveCampaign = async (campaignId: string) => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to save campaigns",
        variant: "destructive",
      });
      return false;
    }

    try {
      setError(null);
      const response = await fetch("/api/saved-campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ campaignId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save campaign");
      }

      const data = await response.json();

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
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to unsave campaigns",
        variant: "destructive",
      });
      return false;
    }

    try {
      setError(null);
      const response = await fetch("/api/saved-campaign", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ campaignId }),
      });

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
