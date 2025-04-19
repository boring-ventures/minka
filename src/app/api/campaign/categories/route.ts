import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

      // Query to get unique categories and their counts
      const { data, error } = await supabase
        .from("campaigns")
        .select("category, count(*)")
        .eq("campaign_status", "active")
        .group("category")
        .order("count", { ascending: false });

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }

      // Format the response
      const categories = data.map((item) => ({
        name: item.category,
        count: item.count,
      }));

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
