import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Fallback locations data for development
const mockLocations = [
  { name: "La Paz", count: 45 },
  { name: "Santa Cruz", count: 38 },
  { name: "Cochabamba", count: 25 },
  { name: "Sucre", count: 12 },
  { name: "Oruro", count: 8 },
  { name: "Potosí", count: 6 },
  { name: "Tarija", count: 5 },
  { name: "Beni", count: 4 },
  { name: "Pando", count: 3 },
];

export async function GET() {
  try {
    try {
      // Create Supabase client
      const supabase = createRouteHandlerClient({
        cookies: () => cookies(),
      });

      // Query to get unique locations and their counts
      const { data, error } = await supabase
        .from("campaigns")
        .select("location, count(*)")
        .eq("campaign_status", "active")
        .group("location")
        .order("count", { ascending: false });

      if (error) {
        console.error("Error fetching locations:", error);
        throw error;
      }

      // Format the response
      const locations = data.map((item) => ({
        name: item.location,
        count: item.count,
      }));

      return NextResponse.json({ locations });
    } catch (dbError) {
      console.error("Database error fetching locations:", dbError);

      // In development mode, return mock data as a fallback
      if (process.env.NODE_ENV === "development") {
        console.log("Using mock locations data as fallback");
        return NextResponse.json({ locations: mockLocations });
      }

      // In production, return an empty list with a message
      return NextResponse.json(
        {
          locations: [],
          error: "Database error, please try again later.",
        },
        { status: 200 } // Return 200 instead of 500 to handle the error gracefully
      );
    }
  } catch (error) {
    console.error("Error in campaign locations endpoint:", error);

    // Return a user-friendly error response with 200 status
    return NextResponse.json(
      {
        locations: [],
        error: "An unexpected error occurred. Please try again later.",
      },
      { status: 200 }
    );
  }
}
