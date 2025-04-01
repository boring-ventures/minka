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
    const supabase = createRouteHandlerClient({ cookies });
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
    const { campaignStatus, verificationStatus } = body;

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

    // Update campaign status and verification status
    const campaign = await db.campaign.update({
      where: {
        id: params.id,
        organizerId: organizer.id, // Ensure the user owns the campaign
      },
      data: {
        ...(campaignStatus && { campaignStatus }),
        ...(typeof verificationStatus === "boolean" && { verificationStatus }),
      },
    });

    return NextResponse.json(
      { message: "Campaign status updated successfully", campaign },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating campaign status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
