import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const campaignId = (await params).id;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get the session to check if the user is authenticated
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Check if the user is the campaign owner
    let isOwner = false;
    if (session?.user) {
      const campaign = await db.campaign.findUnique({
        where: {
          id: campaignId,
        },
        include: {
          organizer: {
            select: {
              email: true,
            },
          },
        },
      });

      if (campaign?.organizer.email === session.user.email) {
        isOwner = true;
      }
    }

    // Get donations based on whether user is owner or not
    // If the user is not the owner, only return public information
    const donations = await db.donation.findMany({
      where: {
        campaignId: campaignId,
        status: "active",
      },
      select: {
        id: true,
        amount: true,
        currency: true,
        message: isOwner ? true : false,
        isAnonymous: true,
        createdAt: true,
        status: isOwner ? true : false,
        donor: {
          select: {
            id: true,
            name: true,
            profilePicture: isOwner ? true : false,
            email: isOwner ? true : false,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    // Count total donations
    const total = await db.donation.count({
      where: {
        campaignId: campaignId,
        status: "active",
      },
    });

    // Get total amount raised
    const totalAmountResult = await db.donation.aggregate({
      where: {
        campaignId: campaignId,
        status: "active",
      },
      _sum: {
        amount: true,
      },
    });

    const totalAmount = totalAmountResult._sum.amount || 0;

    // Format the donations to handle anonymous donors
    const formattedDonations = donations.map((donation) => {
      if (donation.isAnonymous && !isOwner) {
        return {
          ...donation,
          donor: {
            id: null,
            name: "Donador anónimo",
          },
        };
      }
      return donation;
    });

    return NextResponse.json({
      donations: formattedDonations,
      total,
      totalAmount,
      hasMore: offset + limit < total,
      isOwner,
    });
  } catch (error) {
    console.error("Error fetching campaign donations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Admin endpoint to manage donation status
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

    const campaignId = (await params).id;
    const body = await req.json();
    const { donationId, status } = body;

    if (!donationId || !status) {
      return NextResponse.json(
        { error: "Donation ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status value
    if (!["pending", "active", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Find user profile
    const profile = await db.profile.findUnique({
      where: { email: session.user.email },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Verify user is campaign owner or admin
    const campaign = await db.campaign.findUnique({
      where: {
        id: campaignId,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (campaign.organizerId !== profile.id && profile.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "You don't have permission to manage donations for this campaign",
        },
        { status: 403 }
      );
    }

    // Update donation status
    const donation = await db.donation.update({
      where: {
        id: donationId,
        campaignId: campaignId,
      },
      data: {
        status,
      },
    });

    // If the donation was activated, update the campaign's collected amount
    if (status === "active") {
      await db.campaign.update({
        where: {
          id: campaignId,
        },
        data: {
          collectedAmount: {
            increment: donation.amount,
          },
        },
      });
    } else if (status === "rejected" && donation.status === "active") {
      // If an active donation was rejected, decrement the collected amount
      await db.campaign.update({
        where: {
          id: campaignId,
        },
        data: {
          collectedAmount: {
            decrement: donation.amount,
          },
        },
      });
    }

    return NextResponse.json({ success: true, donation });
  } catch (error) {
    console.error("Error updating donation status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
