import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const campaignId = (await params).id;
    const session = await getAuthSession();

    const campaign = await db.campaign.findUnique({
      where: {
        id: campaignId,
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
            location: true,
            joinDate: true,
            activeCampaignsCount: true,
            bio: true,
            verificationStatus: true,
          },
        },
        media: {
          orderBy: {
            orderIndex: "asc",
          },
        },
        updates: {
          where: {
            status: "active",
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        donations: {
          where: {
            status: "active",
          },
          include: {
            donor: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        comments: {
          where: {
            status: "active",
          },
          include: {
            profile: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // If campaign is in draft status, only the creator should be able to view it
    if (campaign.campaignStatus === "draft") {
      if (!session?.user || campaign.organizer.email !== session.user.email) {
        return NextResponse.json(
          { error: "You don't have permission to view this campaign" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
        media.map((item: any) =>
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
