import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    // Create Supabase client with properly handled cookies
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore,
    });

    // Get the session from Supabase
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const profile = await db.profile.findUnique({
      where: { email: session.user.email },
    });

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Only administrators can access this resource" },
        { status: 403 }
      );
    }

    // Get URL query parameters
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "pending"; // Default to pending
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const page = parseInt(url.searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    // Define the where clause for filter
    const where: any = {};
    if (status !== "all") {
      where.verificationStatus = status;
    }

    // Fetch verification requests
    const verificationRequests = await db.campaignVerification.findMany({
      where,
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
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
      orderBy: {
        requestDate: "desc",
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalCount = await db.campaignVerification.count({
      where,
    });

    // Format the response data
    const formattedRequests = verificationRequests.map((verification) => {
      // Get the primary image or fallback to default
      const imageUrl = verification.campaign.media[0]?.mediaUrl || null;

      return {
        id: verification.id,
        campaign: {
          id: verification.campaign.id,
          title: verification.campaign.title,
          image_url: imageUrl,
        },
        requestDate: verification.requestDate.toISOString(),
        approvalDate: verification.approvalDate?.toISOString() || null,
        status: verification.verificationStatus,
        idDocumentUrl: verification.idDocumentUrl,
        supportingDocsUrls: verification.supportingDocsUrls,
        campaignStory: verification.campaignStory,
        referenceContactName: verification.referenceContactName,
        referenceContactEmail: verification.referenceContactEmail,
        referenceContactPhone: verification.referenceContactPhone,
        notes: verification.notes,
      };
    });

    return NextResponse.json({
      requests: formattedRequests,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching verification requests:", error);
    return NextResponse.json(
      {
        error: "Server error",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
