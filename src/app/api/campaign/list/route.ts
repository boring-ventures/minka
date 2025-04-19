import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Fallback campaign data for development
const mockCampaigns = [
  {
    id: "1",
    title: "Protejamos juntos el Parque Nacional Amboró",
    description:
      "El Parque Nacional Amboró es uno de los lugares más biodiversos del mundo, hogar de especies únicas y ecosistemas vitales. Su conservación depende de todos nosotros.",
    category: "Medio ambiente",
    location: "Santa Cruz",
    goalAmount: 5000,
    collectedAmount: 4000,
    donorCount: 250,
    percentageFunded: 80,
    daysRemaining: 15,
    verified: true,
    organizer: {
      id: "org1",
      name: "Fundación Naturaleza",
      location: "Santa Cruz",
      profilePicture: null,
    },
    primaryImage: "/landing-page/dummies/Card/Imagen.png",
  },
  {
    id: "2",
    title: "Educación para niños en zonas rurales",
    description:
      "Ayúdanos a llevar educación de calidad a niños en zonas rurales de Bolivia que no tienen acceso a escuelas o materiales educativos adecuados.",
    category: "Educación",
    location: "La Paz",
    goalAmount: 3000,
    collectedAmount: 1950,
    donorCount: 180,
    percentageFunded: 65,
    daysRemaining: 30,
    verified: true,
    organizer: {
      id: "org2",
      name: "Fundación Educativa",
      location: "La Paz",
      profilePicture: null,
    },
    primaryImage: "/landing-page/dummies/Card/Imagen.png",
  },
  {
    id: "3",
    title: "Apoyo a artesanos locales",
    description:
      "Apoya a los artesanos locales para preservar técnicas tradicionales y promover el desarrollo económico sostenible en comunidades rurales.",
    category: "Cultura y arte",
    location: "Cochabamba",
    goalAmount: 2500,
    collectedAmount: 1125,
    donorCount: 120,
    percentageFunded: 45,
    daysRemaining: 25,
    verified: false,
    organizer: {
      id: "org3",
      name: "Artesanos Unidos",
      location: "Cochabamba",
      profilePicture: null,
    },
    primaryImage: "/landing-page/dummies/Card/Imagen.png",
  },
  {
    id: "4",
    title: "Centro de salud para comunidad indígena",
    description:
      "Ayuda a construir un centro de salud para comunidades indígenas que actualmente deben viajar largas distancias para recibir atención médica básica.",
    category: "Salud",
    location: "Beni",
    goalAmount: 7000,
    collectedAmount: 6300,
    donorCount: 320,
    percentageFunded: 90,
    daysRemaining: 10,
    verified: true,
    organizer: {
      id: "org4",
      name: "Médicos Solidarios",
      location: "Beni",
      profilePicture: null,
    },
    primaryImage: "/landing-page/dummies/Card/Imagen.png",
  },
  {
    id: "5",
    title: "Reforestación en la Amazonía",
    description:
      "Contribuye a nuestro proyecto de reforestación en la Amazonía boliviana para combatir la deforestación y proteger el pulmón del planeta.",
    category: "Medio ambiente",
    location: "Pando",
    goalAmount: 4000,
    collectedAmount: 1200,
    donorCount: 95,
    percentageFunded: 30,
    daysRemaining: 45,
    verified: true,
    organizer: {
      id: "org5",
      name: "Amazonía Viva",
      location: "Pando",
      profilePicture: null,
    },
    primaryImage: "/landing-page/dummies/Card/Imagen.png",
  },
  {
    id: "6",
    title: "Empoderamiento de mujeres emprendedoras",
    description:
      "Apoya a mujeres emprendedoras de comunidades vulnerables con capacitación y microcréditos para iniciar sus propios negocios sostenibles.",
    category: "Igualdad",
    location: "Santa Cruz",
    goalAmount: 3500,
    collectedAmount: 2625,
    donorCount: 210,
    percentageFunded: 75,
    daysRemaining: 20,
    verified: true,
    organizer: {
      id: "org6",
      name: "Mujeres Emprendedoras",
      location: "Santa Cruz",
      profilePicture: null,
    },
    primaryImage: "/landing-page/dummies/Card/Imagen.png",
  },
];

// Define interfaces for better type safety
interface OrganizerProfile {
  id: string;
  name: string;
  location: string;
  profile_picture: string;
}

interface CampaignMedia {
  id: string;
  media_url: string;
  is_primary: boolean;
  type: string;
  order_index: number;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  goal_amount: number;
  collected_amount: number;
  donor_count: number;
  percentage_funded: number;
  days_remaining: number;
  created_at: string;
  verification_status: boolean;
  organizer_id: string;
  organizer: OrganizerProfile | null;
  media: CampaignMedia[];
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    // Get all query parameters for filtering
    const category = url.searchParams.get("category");
    const location = url.searchParams.get("location");
    const search = url.searchParams.get("search");
    const sortBy = url.searchParams.get("sortBy") || "popular"; // default sort
    const verified = url.searchParams.get("verified");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "12"); // items per page

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    try {
      // Create Supabase client
      const supabase = createRouteHandlerClient({
        cookies: () => cookies(),
      });

      // Start building the query
      let query = supabase
        .from("campaigns")
        .select(
          `
          id, 
          title, 
          description,
          category,
          location,
          goal_amount,
          collected_amount,
          donor_count,
          percentage_funded,
          days_remaining,
          created_at,
          verification_status,
          organizer_id,
          organizer:profiles!organizer_id(id, name, location, profile_picture),
          media:campaign_media(
            id, 
            media_url, 
            is_primary, 
            type, 
            order_index
          )
        `
        )
        .eq("campaign_status", "active") // Only active campaigns
        .range(offset, offset + limit - 1);

      // Apply filters if they exist
      if (category) {
        query = query.eq("category", category);
      }

      if (location) {
        query = query.eq("location", location);
      }

      if (search) {
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      if (verified === "true") {
        query = query.eq("verification_status", true);
      }

      // Apply sorting
      switch (sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "most_funded":
          query = query.order("percentage_funded", { ascending: false });
          break;
        case "ending_soon":
          query = query.order("days_remaining", { ascending: true });
          break;
        case "popular":
        default:
          query = query.order("donor_count", { ascending: false });
          break;
      }

      // Execute the query
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }

      // Format the response
      const campaigns = data.map((campaign) => {
        // Find primary image
        const primaryMedia = Array.isArray(campaign.media)
          ? campaign.media.find((m) => m.is_primary)
          : null;

        let organizerData = null;

        if (campaign.organizer) {
          if (
            Array.isArray(campaign.organizer) &&
            campaign.organizer.length > 0
          ) {
            // Handle the case where it's an array (take the first item)
            const firstOrganizer = campaign.organizer[0];
            organizerData = {
              id: firstOrganizer.id,
              name: firstOrganizer.name,
              location: firstOrganizer.location,
              profilePicture: firstOrganizer.profile_picture,
            };
          } else if (typeof campaign.organizer === "object") {
            // Handle the case where it's a single object
            // Use unknown type first to avoid TypeScript errors
            const organizer = campaign.organizer as unknown;
            if (
              organizer &&
              typeof organizer === "object" &&
              !Array.isArray(organizer)
            ) {
              const typedOrganizer = organizer as {
                id?: string;
                name?: string;
                location?: string;
                profile_picture?: string;
              };
              organizerData = {
                id: typedOrganizer.id || "",
                name: typedOrganizer.name || "",
                location: typedOrganizer.location || "",
                profilePicture: typedOrganizer.profile_picture || "",
              };
            }
          }
        }

        return {
          id: campaign.id,
          title: campaign.title,
          description: campaign.description,
          category: campaign.category,
          location: campaign.location,
          goalAmount: campaign.goal_amount,
          collectedAmount: campaign.collected_amount,
          donorCount: campaign.donor_count,
          percentageFunded: campaign.percentage_funded,
          daysRemaining: campaign.days_remaining,
          verified: campaign.verification_status,
          organizer: organizerData,
          primaryImage: primaryMedia ? primaryMedia.media_url : null,
        };
      });

      // Get the count in a separate query
      const countQuery = supabase
        .from("campaigns")
        .select("id", { count: "exact" })
        .eq("campaign_status", "active");

      // Apply the same filters to the count query
      if (category) {
        countQuery.eq("category", category);
      }

      if (location) {
        countQuery.eq("location", location);
      }

      if (search) {
        countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      if (verified === "true") {
        countQuery.eq("verification_status", true);
      }

      // Execute count query
      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Error getting count:", countError);
        throw countError;
      }

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      return NextResponse.json({
        campaigns,
        pagination: {
          totalCount,
          totalPages,
          currentPage: page,
          limit,
          hasMore: page < totalPages,
        },
      });
    } catch (dbError) {
      console.error("Database error:", dbError);

      // In development mode, return mock data as a fallback
      if (process.env.NODE_ENV === "development") {
        console.log("Using mock data as fallback");

        // Apply filters to mock data
        let filteredMockCampaigns = [...mockCampaigns];

        if (category) {
          filteredMockCampaigns = filteredMockCampaigns.filter(
            (c) => c.category === category
          );
        }

        if (location) {
          filteredMockCampaigns = filteredMockCampaigns.filter(
            (c) => c.location === location
          );
        }

        if (search) {
          const searchLower = search.toLowerCase();
          filteredMockCampaigns = filteredMockCampaigns.filter(
            (c) =>
              c.title.toLowerCase().includes(searchLower) ||
              c.description.toLowerCase().includes(searchLower)
          );
        }

        if (verified === "true") {
          filteredMockCampaigns = filteredMockCampaigns.filter(
            (c) => c.verified === true
          );
        }

        // Apply sorting
        switch (sortBy) {
          case "newest":
            // No date in mock data, just use the order
            break;
          case "most_funded":
            filteredMockCampaigns.sort(
              (a, b) => b.percentageFunded - a.percentageFunded
            );
            break;
          case "ending_soon":
            filteredMockCampaigns.sort(
              (a, b) => a.daysRemaining - b.daysRemaining
            );
            break;
          case "popular":
          default:
            filteredMockCampaigns.sort((a, b) => b.donorCount - a.donorCount);
            break;
        }

        // Apply pagination
        const totalCount = filteredMockCampaigns.length;
        const totalPages = Math.ceil(totalCount / limit);
        const paginatedMockCampaigns = filteredMockCampaigns.slice(
          offset,
          offset + limit
        );

        return NextResponse.json({
          campaigns: paginatedMockCampaigns,
          pagination: {
            totalCount,
            totalPages,
            currentPage: page,
            limit,
            hasMore: page < totalPages,
          },
        });
      }

      // In production, return an empty list with error message
      return NextResponse.json(
        {
          campaigns: [],
          pagination: {
            totalCount: 0,
            totalPages: 0,
            currentPage: page,
            limit,
            hasMore: false,
          },
          error: "Database error, please try again later.",
        },
        { status: 200 } // Return 200 instead of 500 to handle the error gracefully
      );
    }
  } catch (error) {
    console.error("Error in campaign list endpoint:", error);

    // Return a user-friendly error response with 200 status to handle the error gracefully
    return NextResponse.json(
      {
        campaigns: [],
        pagination: {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          limit: 12,
          hasMore: false,
        },
        error: "An unexpected error occurred. Please try again later.",
      },
      { status: 200 }
    );
  }
}
