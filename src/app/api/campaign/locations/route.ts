import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

// Map database enum values to display names
const displayLocationMap: Record<string, string> = {
  la_paz: "La Paz",
  santa_cruz: "Santa Cruz",
  cochabamba: "Cochabamba",
  sucre: "Sucre",
  oruro: "Oruro",
  potosi: "Potosí",
  tarija: "Tarija",
  beni: "Beni",
  pando: "Pando",
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    // Get filters from query parameters
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");
    const verified = url.searchParams.get("verified") === "true";

    console.log("Locations API - Received filters:", {
      category,
      search,
      verified,
    });

    try {
      // Use Prisma directly instead of raw SQL for better type safety and filtering
      const whereClause: any = {
        campaignStatus: "active",
        status: "active",
      };

      // Apply filters if they exist
      if (category) {
        whereClause.category = category;
      }

      if (verified) {
        whereClause.verificationStatus = true;
      }

      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      // Get all campaigns that match the filters
      const campaigns = await db.campaign.findMany({
        where: whereClause,
        select: {
          location: true,
        },
      });

      console.log(
        `Locations API - Found ${campaigns.length} total campaigns matching filters`
      );

      // Count the occurrences of each location
      const locationCounts: Record<string, number> = {};

      campaigns.forEach((campaign) => {
        const location = campaign.location.toString();
        locationCounts[location] = (locationCounts[location] || 0) + 1;
      });

      console.log("Locations API - Location counts:", locationCounts);

      // Format the locations for the response
      const locations = Object.entries(locationCounts)
        .map(([location, count]) => ({
          name: displayLocationMap[location] || location,
          count: count,
        }))
        .sort((a, b) => b.count - a.count);

      return NextResponse.json({ locations });
    } catch (dbError) {
      console.error("Database error in locations API:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error("Error fetching locations:", error);

    // In development mode, return mock data as a fallback
    if (process.env.NODE_ENV === "development") {
      console.log("Using mock locations data as fallback");
      return NextResponse.json({ locations: mockLocations });
    }

    // In production, return an empty list with a message
    return NextResponse.json(
      {
        locations: [],
        error: "Error fetching locations. Please try again later.",
      },
      { status: 200 } // Return 200 instead of 500 to handle the error gracefully
    );
  }
}

// Helper function to format location from DB enum to display format
function formatLocation(location: string) {
  const locationMap: Record<string, string> = {
    la_paz: "La Paz",
    santa_cruz: "Santa Cruz",
    cochabamba: "Cochabamba",
    sucre: "Sucre",
    oruro: "Oruro",
    potosi: "Potosí",
    tarija: "Tarija",
    beni: "Beni",
    pando: "Pando",
  };

  return locationMap[location] || location;
}
