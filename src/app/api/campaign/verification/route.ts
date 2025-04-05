import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { z } from "zod";

// Schema for campaign verification request
const verificationRequestSchema = z.object({
  campaignId: z.string().uuid(),
  idDocumentUrl: z.string().url().optional(),
  supportingDocsUrls: z.array(z.string().url()).optional(),
  campaignStory: z.string().min(10).max(5000).optional(),
  referenceContactName: z.string().min(3).max(100).optional(),
  referenceContactEmail: z.string().email().optional(),
  referenceContactPhone: z.string().min(5).max(20).optional(),
});

// Route handler for POST request to submit verification
export async function POST(req: NextRequest) {
  try {
    // Get session using supabase client
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

    // Validate request body
    const body = await req.json();
    const validatedData = verificationRequestSchema.parse(body);

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

    // Get the campaign to verify
    const campaign = await db.campaign.findUnique({
      where: {
        id: validatedData.campaignId,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Check if user is the campaign organizer
    if (campaign.organizerId !== organizer.id) {
      return NextResponse.json(
        { error: "You don't have permission to verify this campaign" },
        { status: 403 }
      );
    }

    // Check if verification already exists
    const existingVerification = await db.campaignVerification.findUnique({
      where: {
        campaignId: validatedData.campaignId,
      },
    });

    if (existingVerification) {
      // If it exists but is rejected, update it instead of creating a new one
      if (existingVerification.verificationStatus === "rejected") {
        const updatedVerification = await db.campaignVerification.update({
          where: {
            id: existingVerification.id,
          },
          data: {
            requestDate: new Date(),
            approvalDate: null,
            verificationStatus: "pending",
            idDocumentUrl:
              validatedData.idDocumentUrl || existingVerification.idDocumentUrl,
            supportingDocsUrls:
              validatedData.supportingDocsUrls ||
              existingVerification.supportingDocsUrls,
            campaignStory:
              validatedData.campaignStory || existingVerification.campaignStory,
            referenceContactName:
              validatedData.referenceContactName ||
              existingVerification.referenceContactName,
            referenceContactEmail:
              validatedData.referenceContactEmail ||
              existingVerification.referenceContactEmail,
            referenceContactPhone:
              validatedData.referenceContactPhone ||
              existingVerification.referenceContactPhone,
          },
        });

        return NextResponse.json({
          message: "Campaign verification request updated successfully",
          verificationId: updatedVerification.id,
        });
      }

      return NextResponse.json(
        {
          error: "Verification request already exists for this campaign",
          status: existingVerification.verificationStatus,
        },
        { status: 409 }
      );
    }

    // Create new verification request
    const verification = await db.campaignVerification.create({
      data: {
        campaignId: validatedData.campaignId,
        idDocumentUrl: validatedData.idDocumentUrl,
        supportingDocsUrls: validatedData.supportingDocsUrls || [],
        campaignStory: validatedData.campaignStory,
        referenceContactName: validatedData.referenceContactName,
        referenceContactEmail: validatedData.referenceContactEmail,
        referenceContactPhone: validatedData.referenceContactPhone,
        verificationStatus: "pending",
      },
    });

    return NextResponse.json({
      message: "Campaign verification request submitted successfully",
      verificationId: verification.id,
    });
  } catch (error) {
    console.error("Error submitting campaign verification:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit verification request" },
      { status: 500 }
    );
  }
}

// Get verification status for a campaign
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const campaignId = url.searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Get verification for the campaign
    const verification = await db.campaignVerification.findUnique({
      where: {
        campaignId,
      },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "No verification request found for this campaign" },
        { status: 404 }
      );
    }

    return NextResponse.json({ verification });
  } catch (error) {
    console.error("Error getting campaign verification:", error);
    return NextResponse.json(
      { error: "Failed to get verification status" },
      { status: 500 }
    );
  }
}
