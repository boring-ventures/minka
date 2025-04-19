import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Interface for category count data
interface CategoryCount {
  category: string;
  count: string | number;
}

// Fallback categories data for development
const mockCategories = [
  { name: "Medio ambiente", count: 42 },
  { name: "Educación", count: 35 },
  { name: "Salud", count: 28 },
  { name: "Igualdad", count: 21 },
  { name: "Cultura y arte", count: 15 },
  { name: "Deporte", count: 12 },
];

export async function GET() {
  try {
    try {
      // Create Supabase client
      const supabase = createRouteHandlerClient({
        cookies: () => cookies(),
      });

      // Use a raw SQL query to get categories and counts
      const { data, error } = await supabase.rpc("get_category_counts");

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }

      // If RPC function doesn't exist, try with raw SQL
      if (!data) {
        const { data: rawData, error: rawError } = await supabase
          .from("campaigns")
          .select("category")
          .eq("campaign_status", "active");

        if (rawError) {
          console.error("Error with raw query:", rawError);
          throw rawError;
        }

        // Manually count categories with proper typing
        const categoryCounts: Record<string, number> = rawData.reduce(
          (acc: Record<string, number>, item: { category: string }) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
          },
          {}
        );

        // Format into the expected structure
        const categories = Object.entries(categoryCounts)
          .map(([name, count]) => ({
            name,
            count,
          }))
          .sort((a, b) => b.count - a.count);

        return NextResponse.json({ categories });
      }

      // Format the response if RPC worked
      const categories = (data as CategoryCount[]).map(
        (item: CategoryCount) => ({
          name: item.category,
          count:
            typeof item.count === "string" ? parseInt(item.count) : item.count,
        })
      );

      return NextResponse.json({ categories });
    } catch (dbError) {
      console.error("Database error fetching categories:", dbError);

      // In development mode, return mock data as a fallback
      if (process.env.NODE_ENV === "development") {
        console.log("Using mock categories data as fallback");
        return NextResponse.json({ categories: mockCategories });
      }

      // In production, return an empty list with a message
      return NextResponse.json(
        {
          categories: [],
          error: "Database error, please try again later.",
        },
        { status: 200 } // Return 200 instead of 500 to handle the error gracefully
      );
    }
  } catch (error) {
    console.error("Error in campaign categories endpoint:", error);

    // Return a user-friendly error response with 200 status
    return NextResponse.json(
      {
        categories: [],
        error: "An unexpected error occurred. Please try again later.",
      },
      { status: 200 }
    );
  }
}
