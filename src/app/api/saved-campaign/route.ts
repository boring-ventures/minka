import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

// GET: Fetch all saved campaigns for the current user
export async function GET() {
  try {
    // Get the current session using Supabase
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore,
    });

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to view saved campaigns" },
        { status: 401 }
      );
    }

    // Get the user profile id from the email
    const profile = await prisma.profile.findUnique({
      where: { email: session.user.email },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Fetch the saved campaigns with campaign details
    const savedCampaigns = await prisma.savedCampaign.findMany({
      where: {
        profileId: profile.id,
        status: "active",
      },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            location: true,
            createdAt: true,
            media: {
              where: {
                isPrimary: true,
              },
              select: {
                mediaUrl: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    // Format the response to match the expected structure
    const formattedCampaigns = savedCampaigns.map((saved) => ({
      id: saved.campaign.id,
      savedId: saved.id,
      title: saved.campaign.title,
      description: saved.campaign.description,
      imageUrl: saved.campaign.media[0]?.mediaUrl || "",
      category: saved.campaign.category,
      location: saved.campaign.location,
      createdAt: saved.campaign.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedCampaigns);
  } catch (error) {
    console.error("Error fetching saved campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved campaigns" },
      { status: 500 }
    );
  }
}

// POST: Save a campaign for the current user
export async function POST(request: NextRequest) {
  try {
    const { campaignId } = await request.json();

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Get the current session using Supabase
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore,
    });

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to save campaigns" },
        { status: 401 }
      );
    }

    // Get the user profile id from the email
    const profile = await prisma.profile.findUnique({
      where: { email: session.user.email },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Check if the campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Check if the campaign is already saved
    const existingSave = await prisma.savedCampaign.findFirst({
      where: {
        profileId: profile.id,
        campaignId,
        status: "active",
      },
    });

    if (existingSave) {
      return NextResponse.json(
        { error: "Campaign already saved" },
        { status: 400 }
      );
    }

    // Save the campaign
    const savedCampaign = await prisma.savedCampaign.create({
      data: {
        profileId: profile.id,
        campaignId,
      },
    });

    return NextResponse.json(savedCampaign);
  } catch (error) {
    console.error("Error saving campaign:", error);
    return NextResponse.json(
      { error: "Failed to save campaign" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a saved campaign for the current user
export async function DELETE(request: NextRequest) {
  try {
    const { campaignId } = await request.json();

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Get the current session using Supabase
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore,
    });

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to unsave campaigns" },
        { status: 401 }
      );
    }

    // Get the user profile id from the email
    const profile = await prisma.profile.findUnique({
      where: { email: session.user.email },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Find the saved campaign
    const savedCampaign = await prisma.savedCampaign.findFirst({
      where: {
        profileId: profile.id,
        campaignId,
        status: "active",
      },
    });

    if (!savedCampaign) {
      return NextResponse.json(
        { error: "Saved campaign not found" },
        { status: 404 }
      );
    }

    // Delete the saved campaign (soft delete by changing status)
    await prisma.savedCampaign.update({
      where: { id: savedCampaign.id },
      data: { status: "inactive" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unsaving campaign:", error);
    return NextResponse.json(
      { error: "Failed to unsave campaign" },
      { status: 500 }
    );
  }
}
