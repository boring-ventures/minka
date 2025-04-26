import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log(`Public API: Redirecting to main campaign API for ID: ${id}`);

  if (!id) {
    console.error("Public API: Campaign ID is required but not provided");
    return NextResponse.json(
      { error: "Campaign ID is required" },
      { status: 400 }
    );
  }

  try {
    // Forward to our main API endpoint
    const response = await fetch(
      `${request.nextUrl.origin}/api/campaign/${id}`,
      {
        headers: {
          cookie: cookies().toString(),
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Public API: Error from main API: ${errorText}`);

      return NextResponse.json(
        { error: `Failed to fetch campaign: ${response.status}` },
        { status: response.status }
      );
    }

    const campaign = await response.json();
    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Public API: Unhandled error:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign data" },
      { status: 500 }
    );
  }
}
