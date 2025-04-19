import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Interface for location count data
interface LocationCount {
  location: string;
  count: string | number;
}

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

      // Use RPC to get locations and counts
      const { data, error } = await supabase.rpc('get_location_counts');

      if (error) {
        console.error("Error fetching locations:", error);
        throw error;
      }

      // If RPC function doesn't exist, try with raw SQL
      if (!data) {
        const { data: rawData, error: rawError } = await supabase
          .from('campaigns')
          .select('location')
          .eq('campaign_status', 'active');
          
        if (rawError) {
          console.error("Error with raw query:", rawError);
          throw rawError;
        }

        // Manually count locations
        const locationCounts: Record<string, number> = rawData.reduce((acc: Record<string, number>, item: { location: string }) => {
          if (item.location) {
            acc[item.location] = (acc[item.location] || 0) + 1;
          }
          return acc;
        }, {});

        // Format into the expected structure
        const locations = Object.entries(locationCounts).map(([name, count]) => ({
          name,
          count,
        })).sort((a, b) => b.count - a.count);

        return NextResponse.json({ locations });
      }

      // Format the response if RPC worked
      const locations = (data as LocationCount[]).map((item: LocationCount) => ({
        name: item.location,
        count: typeof item.count === 'string' ? parseInt(item.count) : item.count,
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
