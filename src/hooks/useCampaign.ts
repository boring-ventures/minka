import { useState, useEffect } from "react";

// Define campaign types
export interface OrganizerProfile {
  id: string;
  name: string;
  location: string;
  profilePicture: string | null;
  join_date?: string;
  active_campaigns_count?: number;
  bio?: string;
}

export interface CampaignMedia {
  id: string;
  media_url: string;
  is_primary: boolean;
  type: string;
  order_index: number | null;
}

export interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  youtube_url?: string;
  created_at: string;
}

export interface CampaignComment {
  id: string;
  message: string;
  created_at: string;
  profile: {
    id: string;
    name: string;
  };
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  story: string;
  beneficiaries_description?: string;
  location: string;
  goal_amount: number;
  collected_amount: number;
  donor_count: number;
  percentage_funded: number;
  days_remaining: number;
  verification_status?: boolean;
  created_at?: string;
  campaign_status?: string;
  organizer: OrganizerProfile | null;
  media: CampaignMedia[];
  updates?: CampaignUpdate[];
  comments?: CampaignComment[];
}

export function useCampaign(campaignId: string | null) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      if (!campaignId) {
        console.log("useCampaign: No campaign ID provided");
        setError("No campaign ID provided");
        return;
      }

      console.log(`useCampaign: Fetching campaign with ID: ${campaignId}`);
      setIsLoading(true);
      setError(null);

      try {
        const url = `/api/campaign/${campaignId}`;
        console.log(`useCampaign: Making fetch request to: ${url}`);

        const response = await fetch(url);
        console.log(
          `useCampaign: Received response with status: ${response.status}`
        );

        // Clone the response so we can log the raw text and still parse JSON
        const clonedResponse = response.clone();
        const rawText = await clonedResponse.text();
        console.log(
          `useCampaign: Raw response: ${rawText.substring(0, 200)}...`
        );

        if (!response.ok) {
          console.error(`useCampaign: API error response: ${rawText}`);

          try {
            const errorData = JSON.parse(rawText);
            throw new Error(errorData.error || "Failed to fetch campaign");
          } catch (parseError) {
            throw new Error(
              `Failed to fetch campaign: ${response.status} ${response.statusText}`
            );
          }
        }

        try {
          const data = JSON.parse(rawText);
          console.log("useCampaign: Received campaign data:", data);

          if (!data || typeof data !== "object") {
            console.error("useCampaign: Invalid data format received:", data);
            throw new Error("Invalid campaign data format received");
          }

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

          console.log(
            "useCampaign: Setting campaign with formatted data:",
            formattedCampaign
          );
          setCampaign(formattedCampaign);
        } catch (parseError) {
          console.error(
            "useCampaign: Error parsing campaign data:",
            parseError
          );
          throw parseError;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        console.error(
          "useCampaign: Error fetching campaign:",
          errorMessage,
          err
        );
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId]);

  return { campaign, isLoading, error };
}
