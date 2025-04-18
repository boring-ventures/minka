import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user (optional, donations can be anonymous)
    const session = await getAuthSession();
    const userId = session?.user?.id;

    // Parse the request body
    const body = await request.json();
    const {
      campaignId,
      amount,
      paymentMethod,
      message,
      isAnonymous = false,
      notificationEnabled = false,
    } = body;

    // Basic validation
    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Valid donation amount is required" },
        { status: 400 }
      );
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    // Set paymentMethod to enum value
    const paymentMethodEnum =
      paymentMethod === "card"
        ? "credit_card"
        : paymentMethod === "qr"
          ? "qr"
          : "bank_transfer";

    // Handle anonymous vs. authenticated donations properly
    // Only require authentication for non-anonymous donations
    if (!isAnonymous && !userId) {
      return NextResponse.json(
        { error: "User must be logged in for non-anonymous donations" },
        { status: 401 }
      );
    }

    // For anonymous donations, we need to handle the profile differently
    let donorProfileId = userId;

    if (isAnonymous) {
      // If donation is anonymous, find or create an anonymous profile
      // We'll check if an anonymous profile exists in our system
      let anonymousProfile = await prisma.profile.findFirst({
        where: {
          email: "anonymous@minka.org",
          identityNumber: "ANONYMOUS",
          name: "Donante Anónimo",
        },
      });

      if (!anonymousProfile) {
        // Create an anonymous profile if it doesn't exist
        anonymousProfile = await prisma.profile.create({
          data: {
            email: "anonymous@minka.org",
            identityNumber: "ANONYMOUS",
            name: "Donante Anónimo",
            passwordHash: "not-applicable",
            phone: "0000000000",
            birthDate: new Date("1900-01-01"),
          },
        });
      }

      donorProfileId = anonymousProfile.id;
    }

    // Create the donation
    const donation = await prisma.donation.create({
      data: {
        campaignId,
        donorId: donorProfileId!,
        amount: Number(amount),
        paymentMethod: paymentMethodEnum,
        paymentStatus: "pending", // Start as pending
        message: message || null,
        isAnonymous,
        notificationEnabled,
        predefinedAmount: !body.customAmount,
      },
    });

    // Update campaign statistics (atomically with a transaction)
    await prisma.$transaction(async (tx) => {
      // Get the current campaign
      const campaign = await tx.campaign.findUnique({
        where: { id: campaignId },
        select: { collectedAmount: true, donorCount: true, goalAmount: true },
      });

      if (!campaign) {
        throw new Error("Campaign not found");
      }

      // Calculate new values
      const newCollectedAmount =
        Number(campaign.collectedAmount) + Number(amount);
      const newDonorCount = campaign.donorCount + 1;
      const percentageFunded =
        (newCollectedAmount / Number(campaign.goalAmount)) * 100;

      // Update the campaign
      await tx.campaign.update({
        where: { id: campaignId },
        data: {
          collectedAmount: newCollectedAmount,
          donorCount: newDonorCount,
          percentageFunded,
        },
      });
    });

    return NextResponse.json(
      { success: true, donationId: donation.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Donation creation error:", error);
    return NextResponse.json(
      { error: "Failed to process donation" },
      { status: 500 }
    );
  }
}
