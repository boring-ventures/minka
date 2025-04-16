import { useState, useEffect } from "react";

// Define campaign types
export interface OrganizerProfile {
  id: string;
  name: string;
  location: string;
  profilePicture: string | null;
}

export interface CampaignMedia {
  id: string;
  media_url: string;
  is_primary: boolean;
  type: string;
  order_index: number | null;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  story: string;
  location: string;
  goal_amount: number;
  collected_amount: number;
  donor_count: number;
  percentage_funded: number;
  days_remaining: number;
  organizer: OrganizerProfile | null;
  media: CampaignMedia[];
}

export function useCampaign(campaignId: string | null) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!campaignId) {
        setError("No campaign ID provided");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/campaign/${campaignId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch campaign");
        }

        const data = await response.json();

        // Transform data to match our expected format
        const formattedCampaign: Campaign = {
          ...data,
          organizer: data.organizer
            ? {
                ...data.organizer,
                profilePicture: data.organizer.profile_picture,
              }
            : null,
        };

        setCampaign(formattedCampaign);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching campaign:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId]);

  return { campaign, isLoading, error };
}
