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
}

interface CampaignMedia {
  id: string;
  media_url: string;
  is_primary: boolean;
  type: string;
  order_index: number | null;
}

interface Campaign {
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  // Await params if it's a Promise
  const paramsObj = params instanceof Promise ? await params : params;
  const id = paramsObj.id;

  if (!id) {
    return NextResponse.json(
      { error: "Campaign ID is required" },
      { status: 400 }
    );
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch campaign data with organizer profile and campaign media
    const { data, error: campaignError } = await supabase
      .from("campaigns")
      .select(
        `
        id, 
        title, 
        description,
        story,
        location,
        goal_amount,
        collected_amount,
        donor_count,
        percentage_funded,
        days_remaining,
        organizer:profiles!organizer_id(id, name, location, profile_picture),
        media:campaign_media(id, media_url, is_primary, type, order_index)
      `
      )
      .eq("id", id)
      .single();

    if (campaignError) {
      return NextResponse.json(
        { error: campaignError.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const campaign = data as any;

    // Format the response with proper type handling
    const formattedCampaign: Campaign = {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      story: campaign.story,
      location: campaign.location,
      goal_amount: campaign.goal_amount,
      collected_amount: campaign.collected_amount,
      donor_count: campaign.donor_count,
      percentage_funded: campaign.percentage_funded,
      days_remaining: campaign.days_remaining,
      organizer: campaign.organizer
        ? {
            id: campaign.organizer.id,
            name: campaign.organizer.name,
            location: campaign.organizer.location,
            profile_picture: campaign.organizer.profile_picture,
          }
        : null,
      media: Array.isArray(campaign.media)
        ? campaign.media.sort(
            (a: CampaignMedia, b: CampaignMedia) =>
              (a.order_index || 999) - (b.order_index || 999)
          )
        : [],
    };

    return NextResponse.json(formattedCampaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign data" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
        id: (await params).id,
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
        id: (await params).id,
      },
      data: updateData,
    });

    // If media was provided, update the media records
    if (media && Array.isArray(media) && media.length > 0) {
      // Delete existing media
      await db.campaignMedia.deleteMany({
        where: { campaignId: (await params).id },
      });

      // Create new media
      await Promise.all(
        media.map(async (item: any) =>
          db.campaignMedia.create({
            data: {
              campaignId: (await params).id,
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
