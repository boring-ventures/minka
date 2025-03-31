import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

// Define the types for campaign form data
export interface CampaignFormData {
  title: string;
  description: string;
  category: string;
  goalAmount: string | number;
  location: string;
  endDate: string;
  story: string;
  mediaFiles?: File[];
  youtubeUrl?: string;
  youtubeUrls?: string[];
  recipient?: string;
  beneficiariesDescription?: string;
  media?: Array<{
    mediaUrl: string;
    type: "image" | "video";
    isPrimary: boolean;
    orderIndex: number;
  }>;
}

// Define types for the create campaign response
interface CreateCampaignResponse {
  message: string;
  campaignId: string;
}

// Define types for the campaign draft response
interface DraftCampaignResponse {
  message: string;
  campaignId: string;
}

export function useCampaign() {
  const [isCreating, setIsCreating] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to create a new campaign
  const createCampaign = async (
    formData: CampaignFormData
  ): Promise<string | null> => {
    setIsCreating(true);

    try {
      // Format the data according to API requirements
      const payload = {
        title: formData.title,
        description: formData.description,
        beneficiariesDescription:
          formData.beneficiariesDescription || formData.story,
        category: formData.category,
        goalAmount: Number(formData.goalAmount),
        location: formData.location,
        endDate: formData.endDate,
        youtubeUrl: formData.youtubeUrl || "",
        youtubeUrls: formData.youtubeUrls || [], // Include all YouTube links
        // Use provided media array if available, otherwise use default
        media: formData.media || [
          {
            mediaUrl: "https://example.com/placeholder-image.jpg",
            type: "image" as const,
            isPrimary: true,
            orderIndex: 0,
          },
        ],
      };

      const response = await fetch("/api/campaign/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create campaign");
      }

      const data: CreateCampaignResponse = await response.json();
      setCampaignId(data.campaignId);
      toast({
        title: "¡Éxito!",
        description: "¡Campaña creada exitosamente!",
      });
      return data.campaignId;
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Error al crear la campaña",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  // Function to save a campaign draft
  const saveCampaignDraft = async (
    formData: CampaignFormData,
    existingCampaignId?: string
  ): Promise<string | null> => {
    setIsSavingDraft(true);

    try {
      // Format the data according to API requirements
      const payload = {
        campaignId: existingCampaignId,
        title: formData.title,
        description: formData.description,
        beneficiariesDescription:
          formData.beneficiariesDescription || formData.story,
        category: formData.category,
        goalAmount: formData.goalAmount
          ? Number(formData.goalAmount)
          : undefined,
        location: formData.location,
        endDate: formData.endDate,
        youtubeUrl: formData.youtubeUrl || "",
        youtubeUrls: formData.youtubeUrls || [], // Include all YouTube links
        // Use provided media array if available
        media: formData.media,
      };

      const response = await fetch("/api/campaign/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save campaign draft");
      }

      const data: DraftCampaignResponse = await response.json();
      setCampaignId(data.campaignId);
      toast({
        title: "Borrador guardado",
        description: "Borrador guardado correctamente",
      });
      return data.campaignId;
    } catch (error) {
      console.error("Error saving campaign draft:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al guardar el borrador",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSavingDraft(false);
    }
  };

  return {
    isCreating,
    isSavingDraft,
    campaignId,
    createCampaign,
    saveCampaignDraft,
  };
}
