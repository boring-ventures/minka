import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    // Get all query parameters for filtering
    const category = url.searchParams.get("category");
    const location = url.searchParams.get("location");
    const search = url.searchParams.get("search");
    const sortBy = url.searchParams.get("sortBy") || "popular"; // default sort
    const verified = url.searchParams.get("verified") === "true";
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "12"); // items per page

    // Calculate offset for pagination
    const skip = (page - 1) * limit;

    // Build the where clause with filters
    const whereClause: any = {
      campaignStatus: "active",
      status: "active",
    };

    // Apply filters if they exist
    if (category) {
      whereClause.category = category;
    }

    if (location) {
      whereClause.location = location;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (verified) {
      whereClause.verificationStatus = true;
    }

    // Determine sort order
    let orderBy: any = {};

    switch (sortBy) {
      case "newest":
        orderBy = { createdAt: "desc" };
        break;
      case "most_funded":
        orderBy = { percentageFunded: "desc" };
        break;
      case "ending_soon":
        orderBy = { daysRemaining: "asc" };
        break;
      case "popular":
      default:
        orderBy = { donorCount: "desc" };
        break;
    }

    // Execute the query to get campaigns
    const campaigns = await db.campaign.findMany({
      where: whereClause,
      include: {
        media: true,
        organizer: {
          select: {
            id: true,
            name: true,
            location: true,
            profilePicture: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Format the campaigns for the response
    const formattedCampaigns = campaigns.map((campaign) => {
      // Find primary image
      const primaryMedia = campaign.media.find((media) => media.isPrimary);

      // Format organizer data
      const organizerData = campaign.organizer
        ? {
            id: campaign.organizer.id,
            name: campaign.organizer.name,
            location: campaign.organizer.location || "",
            profilePicture: campaign.organizer.profilePicture,
          }
        : null;

      return {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        category: formatCategory(campaign.category.toString()), // Format the category for display
        location: formatLocation(campaign.location.toString()), // Format the location for display
        goalAmount: Number(campaign.goalAmount),
        collectedAmount: Number(campaign.collectedAmount),
        donorCount: campaign.donorCount,
        percentageFunded: campaign.percentageFunded,
        daysRemaining: campaign.daysRemaining,
        verified: campaign.verificationStatus,
        organizer: organizerData,
        primaryImage: primaryMedia ? primaryMedia.mediaUrl : null,
      };
    });

    // Get the count of matching campaigns
    const totalCount = await db.campaign.count({
      where: whereClause,
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      campaigns: formattedCampaigns,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        limit,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);

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
        error: "Error fetching campaigns. Please try again later.",
      },
      { status: 200 } // Return 200 to handle errors gracefully on the client side
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
