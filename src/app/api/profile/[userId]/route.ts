import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // First, fetch the profile without related campaigns
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Then fetch campaigns separately with proper handling
    const campaigns = await prisma.campaign.findMany({
      where: { organizerId: userId },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        goalAmount: true,
        collectedAmount: true,
        donorCount: true,
        percentageFunded: true,
        daysRemaining: true,
        location: true,
        endDate: true,
        verificationStatus: true,
        campaignStatus: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        // Explicitly exclude verificationDate and any other problematic fields
      },
    });

    // Fetch other related data
    const donations = await prisma.donation.findMany({
      where: { donorId: userId },
    });

    const comments = await prisma.comment.findMany({
      where: { profileId: userId },
    });

    const savedCampaigns = await prisma.savedCampaign.findMany({
      where: { profileId: userId },
    });

    // Combine all data
    const result = {
      ...profile,
      campaigns,
      donations,
      comments,
      savedCampaigns,
    };

    return new Response(JSON.stringify({ profile: result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("prisma:error", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const json = await request.json();

    const profile = await prisma.profile.update({
      where: { id: userId },
      data: {
        name: json.name,
        phone: json.phone,
        profilePicture: json.profilePicture,
        address: json.address,
        bio: json.bio,
        location: json.location,
        birthDate: json.birthDate ? new Date(json.birthDate) : undefined,
        verificationStatus: json.verificationStatus,
        status: json.status,
      },
    });

    return new Response(JSON.stringify({ profile }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
