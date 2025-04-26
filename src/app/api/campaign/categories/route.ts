import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Interface for category count data
interface CategoryCount {
  category: string;
  count: string | number;
}

// Fallback categories data for development if needed
const mockCategories = [
  { name: "Medio ambiente", count: 42 },
  { name: "Educación", count: 35 },
  { name: "Salud", count: 28 },
  { name: "Igualdad", count: 21 },
  { name: "Cultura y arte", count: 15 },
  { name: "Emergencia", count: 12 },
];

// Map display names to database enum values
const categoryEnumMap: Record<string, string> = {
  "Cultura y arte": "cultura_arte",
  Educación: "educacion",
  Emergencia: "emergencia",
  Igualdad: "igualdad",
  "Medio ambiente": "medioambiente",
  Salud: "salud",
  Otros: "otros",
};

// Map database enum values to display names
const displayCategoryMap: Record<string, string> = {
  cultura_arte: "Cultura y arte",
  educacion: "Educación",
  emergencia: "Emergencia",
  igualdad: "Igualdad",
  medioambiente: "Medio ambiente",
  salud: "Salud",
  otros: "Otros",
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    // Get filters from query parameters
    const location = url.searchParams.get("location");
    const search = url.searchParams.get("search");
    const verified = url.searchParams.get("verified") === "true";

    console.log("Categories API - Received filters:", {
      location,
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
      if (location) {
        whereClause.location = location;
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
          category: true,
        },
      });

      console.log(
        `Categories API - Found ${campaigns.length} total campaigns matching filters`
      );

      // Count the occurrences of each category
      const categoryCounts: Record<string, number> = {};

      campaigns.forEach((campaign) => {
        const category = campaign.category.toString();
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      console.log("Categories API - Category counts:", categoryCounts);

      // Format the categories for the response
      const categories = Object.entries(categoryCounts)
        .map(([category, count]) => ({
          name: displayCategoryMap[category] || category,
          count: count,
        }))
        .sort((a, b) => b.count - a.count);

      return NextResponse.json({ categories });
    } catch (dbError) {
      console.error("Database error in categories API:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error("Error fetching categories:", error);

    // In development mode, return mock data as a fallback
    if (process.env.NODE_ENV === "development") {
      console.log("Using mock categories data as fallback");
      return NextResponse.json({ categories: mockCategories });
    }

    // In production, return an empty list with a message
    return NextResponse.json(
      {
        categories: [],
        error: "Error fetching categories. Please try again later.",
      },
      { status: 200 } // Return 200 instead of 500 to handle the error gracefully
    );
  }
}

// Helper function to format category from DB enum to display format
function formatCategory(category: string) {
  const categoryMap: Record<string, string> = {
    cultura_arte: "Cultura y arte",
    educacion: "Educación",
    emergencia: "Emergencia",
    igualdad: "Igualdad",
    medioambiente: "Medio ambiente",
    salud: "Salud",
    otros: "Otros",
  };

  return categoryMap[category] || category;
}
