import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const donationId = (await params).id;

    // Get the authenticated user
    const session = await getAuthSession();
    const userId = session?.user?.id;

    // Parse the request body
    const body = await request.json();

    // Find the donation to verify it exists and belongs to the user
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      select: { id: true, donorId: true, isAnonymous: true },
    });

    // If donation doesn't exist
    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    // Convert property names if they come in with incorrect casing
    // This handles any inconsistency between frontend and backend naming
    const normalizedBody = {
      notificationEnabled:
        body.notificationEnabled !== undefined
          ? body.notificationEnabled
          : body.notification_enabled !== undefined
            ? body.notification_enabled
            : undefined,

      paymentStatus:
        body.paymentStatus !== undefined
          ? body.paymentStatus
          : body.payment_status !== undefined
            ? body.payment_status
            : undefined,

      message: body.message !== undefined ? body.message : undefined,
    };

    // Only allow updates if:
    // 1. The user is authenticated and owns the donation
    // 2. The donation is anonymous and we're just updating notification settings
    const isOwner = userId && donation.donorId === userId;
    const isAnonymousUpdate =
      donation.isAnonymous &&
      Object.keys(normalizedBody).length === 1 &&
      normalizedBody.notificationEnabled !== undefined;

    if (!isOwner && !isAnonymousUpdate) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update the donation
    const updatedDonation = await prisma.donation.update({
      where: { id: donationId },
      data: {
        // Only allow updating specific fields
        notificationEnabled: normalizedBody.notificationEnabled,

        // Only allow updating payment status if provided
        paymentStatus: normalizedBody.paymentStatus,

        // Only allow updating message if provided
        message: normalizedBody.message,
      },
      select: {
        id: true,
        notificationEnabled: true,
        paymentStatus: true,
      },
    });

    return NextResponse.json(updatedDonation);
  } catch (error) {
    console.error("Donation update error:", error);
    return NextResponse.json(
      { error: "Failed to update donation" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const donationId = (await params).id;

    // Get the authenticated user
    const session = await getAuthSession();
    const userId = session?.user?.id;

    // Find the donation
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            media: {
              where: { isPrimary: true },
              select: { mediaUrl: true },
              take: 1,
            },
          },
        },
      },
    });

    // If donation doesn't exist
    if (!donation) {
      return NextResponse.json(
        { error: "Donation not found" },
        { status: 404 }
      );
    }

    // Only allow access if:
    // 1. The user is authenticated and owns the donation
    // 2. The donation is not anonymous (public info)
    const isOwner = userId && donation.donorId === userId;

    if (!isOwner && donation.isAnonymous) {
      // For anonymous donations not owned by the requester, return limited info
      return NextResponse.json({
        id: donation.id,
        amount: donation.amount,
        campaign: donation.campaign,
        isAnonymous: true,
        createdAt: donation.createdAt,
      });
    }

    // Return full donation info for the owner
    return NextResponse.json(donation);
  } catch (error) {
    console.error("Donation retrieve error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve donation" },
      { status: 500 }
    );
  }
}
