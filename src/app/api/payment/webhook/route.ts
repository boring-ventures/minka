import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This is a mock webhook handler for payment status updates
// In a real application, this would need to verify the webhook signature
// and handle different payment processors appropriately
export async function POST(request: NextRequest) {
  try {
    // Get the webhook payload
    const body = await request.json();

    // Basic validation
    if (!body.donationId || !body.paymentStatus) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { donationId, paymentStatus, transactionId } = body;

    // Validate payment status is one of the allowed values
    const validStatuses = ["pending", "completed", "failed", "refunded"];
    if (!validStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: "Invalid payment status" },
        { status: 400 }
      );
    }

    // Get the current donation
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      select: {
        id: true,
        campaignId: true,
        amount: true,
        paymentStatus: true,
      },
    });

    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    // If the donation is already in the target state, just return success
    if (donation.paymentStatus === paymentStatus) {
      return NextResponse.json({ success: true, status: "unchanged" });
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Update the donation
      const updatedDonation = await tx.donation.update({
        where: { id: donationId },
        data: {
          paymentStatus,
          // Store transaction ID if provided
          message: transactionId
            ? `Transaction ID: ${transactionId}`
            : undefined,
        },
      });

      // If payment is completed and it wasn't before, update campaign amounts
      if (
        paymentStatus === "completed" &&
        donation.paymentStatus !== "completed"
      ) {
        // Get the current campaign stats
        const campaign = await tx.campaign.findUnique({
          where: { id: donation.campaignId },
          select: {
            collectedAmount: true,
            goalAmount: true,
            donorCount: true,
          },
        });

        if (campaign) {
          // Calculate new values
          const newCollectedAmount =
            Number(campaign.collectedAmount) + Number(donation.amount);
          const percentageFunded =
            (newCollectedAmount / Number(campaign.goalAmount)) * 100;

          // Update the campaign
          await tx.campaign.update({
            where: { id: donation.campaignId },
            data: {
              collectedAmount: newCollectedAmount,
              percentageFunded,
              donorCount: campaign.donorCount + 1,
            },
          });
        }
      }
      // If payment was completed before but now it's not
      else if (
        donation.paymentStatus === "completed" &&
        paymentStatus !== "completed"
      ) {
        // Get the current campaign stats
        const campaign = await tx.campaign.findUnique({
          where: { id: donation.campaignId },
          select: {
            collectedAmount: true,
            goalAmount: true,
            donorCount: true,
          },
        });

        if (campaign) {
          // Calculate new values (subtract the amount)
          const newCollectedAmount =
            Number(campaign.collectedAmount) - Number(donation.amount);
          const percentageFunded =
            (newCollectedAmount / Number(campaign.goalAmount)) * 100;

          // Update the campaign
          await tx.campaign.update({
            where: { id: donation.campaignId },
            data: {
              collectedAmount: newCollectedAmount > 0 ? newCollectedAmount : 0,
              percentageFunded: percentageFunded > 0 ? percentageFunded : 0,
              donorCount: campaign.donorCount > 0 ? campaign.donorCount - 1 : 0,
            },
          });
        }
      }

      return updatedDonation;
    });

    return NextResponse.json({
      success: true,
      status: "updated",
      donation: {
        id: result.id,
        paymentStatus: result.paymentStatus,
      },
    });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process payment webhook" },
      { status: 500 }
    );
  }
}
