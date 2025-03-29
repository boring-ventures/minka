import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
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
