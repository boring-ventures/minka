import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

// Define interfaces to help with typing
interface OrganizerProfile {
  id: string;
  name: string;
  location: string;
  profile_picture: string | null;
  join_date?: string;
  active_campaigns_count?: number;
  bio?: string;
}

interface CampaignMedia {
  id: string;
  media_url: string;
  is_primary: boolean;
  type: string;
  order_index: number | null;
}

interface CampaignUpdate {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  youtube_url?: string;
  created_at: string;
}

interface CampaignComment {
  id: string;
  message: string;
  created_at: string;
  profile: {
    id: string;
    name: string;
  };
}

interface Campaign {
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
  organizer: OrganizerProfile | null;
  media: CampaignMedia[];
  updates?: CampaignUpdate[];
  comments?: CampaignComment[];
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log(`API: Fetching campaign with ID: ${id}`);

  if (!id) {
    console.error("API: Campaign ID is required but not provided");
    return NextResponse.json(
      { error: "Campaign ID is required" },
      { status: 400 }
    );
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });
    console.log(`API: Created supabase client for campaign: ${id}`);

    // Fetch campaign data with organizer profile and campaign media
    console.log(`API: Executing supabase query for campaign: ${id}`);
    const { data, error: campaignError } = await supabase
      .from("campaigns")
      .select(
        `
        id, 
        title, 
        description,
        story,
        beneficiaries_description,
        location,
        goal_amount,
        collected_amount,
        donor_count,
        percentage_funded,
        days_remaining,
        verification_status,
        created_at,
        organizer:profiles!organizer_id(id, name, location, profile_picture, join_date, active_campaigns_count, bio),
        media:campaign_media(id, media_url, is_primary, type, order_index),
        updates:campaign_updates(id, title, content, image_url, youtube_url, created_at),
        comments:comments(
          id,
          message,
          created_at,
          profile:profiles(id, name)
        )
      `
      )
      .eq("id", id)
      .eq("campaign_status", "active")
      .single();

    if (campaignError) {
      console.error(
        `API: Error fetching campaign data: ${campaignError.message}`,
        campaignError
      );

      // If not found, return 404
      if (campaignError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Campaign not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: campaignError.message, details: campaignError },
        { status: 500 }
      );
    }

    if (!data) {
      console.error(`API: No data found for campaign: ${id}`);
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    console.log(`API: Successfully fetched campaign: ${data.title}`);
    const campaign = data as any;

    // Format the response with proper type handling
    const formattedCampaign: Campaign = {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      story: campaign.story,
      beneficiaries_description: campaign.beneficiaries_description,
      location: campaign.location,
      goal_amount: campaign.goal_amount,
      collected_amount: campaign.collected_amount,
      donor_count: campaign.donor_count,
      percentage_funded: campaign.percentage_funded,
      days_remaining: campaign.days_remaining,
      verification_status: campaign.verification_status,
      created_at: campaign.created_at,
      organizer: campaign.organizer
        ? {
            id: campaign.organizer.id,
            name: campaign.organizer.name,
            location: campaign.organizer.location,
            profile_picture: campaign.organizer.profile_picture,
            join_date: campaign.organizer.join_date,
            active_campaigns_count: campaign.organizer.active_campaigns_count,
            bio: campaign.organizer.bio,
          }
        : null,
      media: Array.isArray(campaign.media)
        ? campaign.media.sort(
            (a: CampaignMedia, b: CampaignMedia) =>
              (a.order_index || 999) - (b.order_index || 999)
          )
        : [],
      updates: Array.isArray(campaign.updates) ? campaign.updates : [],
      comments: Array.isArray(campaign.comments) ? campaign.comments : [],
    };

    return NextResponse.json(formattedCampaign);
  } catch (error) {
    console.error("API: Unhandled error fetching campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign data", details: error },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - You must be logged in" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Find the organizer profile by email
    const organizer = await db.profile.findUnique({
      where: { email: session.user.email },
    });

    if (!organizer) {
      return NextResponse.json(
        { error: "Organizer profile not found" },
        { status: 404 }
      );
    }

    // Get the current campaign to check ownership
    const existingCampaign = await db.campaign.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Ensure the user owns the campaign
    if (existingCampaign.organizerId !== organizer.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this campaign" },
        { status: 403 }
      );
    }

    // Prepare the update data, extracting all valid fields from the body
    const {
      title,
      description,
      story,
      beneficiariesDescription,
      category,
      categoryId,
      goalAmount,
      location,
      endDate,
      youtubeUrl,
      youtubeUrls,
      campaignStatus,
      verificationStatus,
      recipient,
      media,
      presentation,
    } = body;

    // Build the data object dynamically with only the fields that were provided
    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (story !== undefined) updateData.story = story; // Story field = "Presentación de la campaña"
    if (beneficiariesDescription !== undefined)
      updateData.beneficiariesDescription = beneficiariesDescription;
    if (category !== undefined) updateData.category = category;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (goalAmount !== undefined) updateData.goalAmount = goalAmount;
    if (location !== undefined) updateData.location = location;
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl;
    if (youtubeUrls !== undefined) updateData.youtubeUrls = youtubeUrls;
    if (campaignStatus !== undefined)
      updateData.campaignStatus = campaignStatus;
    if (verificationStatus !== undefined)
      updateData.verificationStatus = verificationStatus;
    if (presentation !== undefined) updateData.presentation = presentation;

    // Only set verification date if explicitly verifying the campaign
    if (verificationStatus === true) {
      updateData.verificationDate = new Date();
    }

    // Update campaign with all provided fields
    const campaign = await db.campaign.update({
      where: {
        id: params.id,
      },
      data: updateData,
    });

    // If media was provided, update the media records
    if (media && Array.isArray(media) && media.length > 0) {
      // Delete existing media
      await db.campaignMedia.deleteMany({
        where: { campaignId: params.id },
      });

      // Create new media
      await Promise.all(
        media.map(async (item: any) =>
          db.campaignMedia.create({
            data: {
              campaignId: params.id,
              mediaUrl: item.mediaUrl,
              type: item.type,
              isPrimary: item.isPrimary,
              orderIndex: item.orderIndex,
            },
          })
        )
      );
    }

    return NextResponse.json(
      { message: "Campaign updated successfully", campaign },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
