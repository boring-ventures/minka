import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed process...");

  // Create profiles from the Supabase auth users in the screenshot
  const supabaseUsers = [
    {
      id: "88b86a9f-b6bf-4817-8818-e6f5e04588b2",
      email: "tester5@minka.com",
      name: "Tester Cinco",
    },
    {
      id: "2e800f9d-3866-4e97-9300-68966cf89a57",
      email: "tester4@minka.com",
      name: "Tester Cuatro",
    },
    {
      id: "e509821d-b66d-4d5f-93ce-9ecf2e60cc55",
      email: "tester3@minka.com",
      name: "Tester Tres",
    },
    {
      id: "576f6e70-6af3-4f99-87c6-4662e4b711b8",
      email: "tester2@minka.com",
      name: "Tester Dos",
    },
    {
      id: "31ffa214-3a8e-48ff-b100-0ffd891176ae",
      email: "tester@minka.com",
      name: "Tester Uno",
    },
  ];

  // Create profiles for each Supabase user
  for (const user of supabaseUsers) {
    const existingProfile = await prisma.profile.findUnique({
      where: { email: user.email },
    });

    if (!existingProfile) {
      console.log(`Creating profile for ${user.email}...`);
      await prisma.profile.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          identityNumber: `ID-${Math.floor(Math.random() * 10000000)}`,
          birthDate: new Date(1990, 0, 1), // January 1, 1990
          passwordHash: "supabase-auth-user", // Placeholder since actual auth is handled by Supabase
          phone: `+591 ${Math.floor(Math.random() * 90000000) + 10000000}`,
          joinDate: new Date(),
          location: ["La Paz", "Santa Cruz", "Cochabamba"][
            Math.floor(Math.random() * 3)
          ],
          bio: `${user.name} is a passionate individual interested in crowdfunding projects.`,
          verificationStatus: true,
        },
      });
    } else {
      console.log(`Profile for ${user.email} already exists, skipping...`);
    }
  }

  // Create sample campaigns
  const regions = [
    "la_paz",
    "santa_cruz",
    "cochabamba",
    "sucre",
    "oruro",
    "potosi",
    "tarija",
    "beni",
    "pando",
  ];

  const categories = [
    "cultura_arte",
    "educacion",
    "emergencia",
    "igualdad",
    "medioambiente",
    "salud",
    "otros",
  ];

  const campaignData = [
    {
      title: "Protección del Parque Nacional Amboró",
      description:
        "Campaña para proteger la biodiversidad del Parque Nacional Amboró en Santa Cruz",
      story:
        "El Parque Nacional Amboró es hogar de más de 800 especies de aves y está en peligro debido a la deforestación y caza ilegal. Esta campaña busca financiar guardaparques y equipos de monitoreo para proteger esta área natural vital.",
      category: "medioambiente",
      location: "santa_cruz",
      goalAmount: 50000,
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      organizerEmail: "tester@minka.com",
    },
    {
      title: "Escuela para niños de la comunidad Aymara",
      description:
        "Construcción de una escuela para niños de comunidades rurales aymaras",
      story:
        "Los niños de las comunidades rurales aymaras carecen de infraestructura educativa adecuada. Esta campaña busca construir una escuela que beneficiará a más de 200 niños, brindándoles acceso a educación de calidad.",
      category: "educacion",
      location: "la_paz",
      goalAmount: 80000,
      endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
      organizerEmail: "tester2@minka.com",
    },
    {
      title: "Festival de Arte y Cultura Boliviana",
      description:
        "Organización de un festival que celebra la diversidad cultural de Bolivia",
      story:
        "Este festival busca reunir artistas de todo el país para mostrar la riqueza cultural boliviana. Se realizarán exposiciones, performances y talleres abiertos al público para fomentar el aprecio por nuestras tradiciones.",
      category: "cultura_arte",
      location: "cochabamba",
      goalAmount: 30000,
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      organizerEmail: "tester3@minka.com",
    },
    {
      title: "Apoyo a damnificados por inundaciones",
      description:
        "Ayuda para familias afectadas por las recientes inundaciones en Beni",
      story:
        "Las recientes inundaciones en el departamento de Beni han dejado a cientos de familias sin hogar. Esta campaña busca proporcionar alimentos, agua potable y refugio temporal a los afectados mientras reconstruyen sus vidas.",
      category: "emergencia",
      location: "beni",
      goalAmount: 100000,
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      organizerEmail: "tester4@minka.com",
    },
    {
      title: "Equipamiento para hospital comunitario",
      description:
        "Compra de equipos médicos para mejorar la atención en hospital rural",
      story:
        "El hospital comunitario de Oruro carece de equipos médicos esenciales para atender adecuadamente a la población rural. Con esta campaña buscamos adquirir monitores cardíacos, equipos de ultrasonido y material quirúrgico básico.",
      category: "salud",
      location: "oruro",
      goalAmount: 75000,
      endDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000), // 100 days from now
      organizerEmail: "tester5@minka.com",
    },
  ];

  // Create campaigns
  for (const campaign of campaignData) {
    const organizer = await prisma.profile.findUnique({
      where: { email: campaign.organizerEmail },
    });

    if (!organizer) {
      console.log(
        `Organizer with email ${campaign.organizerEmail} not found, skipping campaign...`
      );
      continue;
    }

    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        title: campaign.title,
        organizerId: organizer.id,
      },
    });

    if (!existingCampaign) {
      console.log(`Creating campaign: ${campaign.title}...`);

      // Calculate days remaining
      const daysRemaining = Math.ceil(
        (campaign.endDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const createdCampaign = await prisma.campaign.create({
        data: {
          title: campaign.title,
          description: campaign.description,
          story: campaign.story,
          beneficiariesDescription: `Los beneficiarios de esta campaña incluyen ${campaign.description.toLowerCase()}`,
          category: campaign.category as any,
          goalAmount: campaign.goalAmount,
          collectedAmount: 0,
          percentageFunded: 0,
          daysRemaining,
          location: campaign.location as any,
          endDate: campaign.endDate,
          campaignStatus: "active",
          organizerId: organizer.id,
          youtubeUrls: [],
        },
      });

      // Create campaign media
      await prisma.campaignMedia.create({
        data: {
          campaignId: createdCampaign.id,
          mediaUrl: `https://source.unsplash.com/random/800x600?${campaign.category}`,
          type: "image",
          isPrimary: true,
          orderIndex: 0,
          status: "active",
        },
      });

      // Update the organizer's active campaign count
      await prisma.profile.update({
        where: { id: organizer.id },
        data: {
          activeCampaignsCount: {
            increment: 1,
          },
        },
      });

      // Create some sample donations
      const donorEmails = supabaseUsers
        .map((u) => u.email)
        .filter((email) => email !== campaign.organizerEmail);

      for (let i = 0; i < 3; i++) {
        if (i < donorEmails.length) {
          const donor = await prisma.profile.findUnique({
            where: { email: donorEmails[i] },
          });

          if (donor) {
            const donationAmount = Math.floor(Math.random() * 1000) + 100;

            await prisma.donation.create({
              data: {
                campaignId: createdCampaign.id,
                donorId: donor.id,
                amount: donationAmount,
                paymentMethod: "credit_card",
                paymentStatus: "completed",
                message: `¡Felicidades por esta gran iniciativa! Espero que lleguen a la meta.`,
                isAnonymous: Math.random() > 0.7, // 30% chance of being anonymous
                notificationEnabled: true,
              },
            });

            // Update campaign stats
            await prisma.campaign.update({
              where: { id: createdCampaign.id },
              data: {
                collectedAmount: {
                  increment: donationAmount,
                },
                donorCount: {
                  increment: 1,
                },
              },
            });
          }
        }
      }

      // Update percentage funded
      const updatedCampaign = await prisma.campaign.findUnique({
        where: { id: createdCampaign.id },
      });

      if (updatedCampaign) {
        const percentageFunded = Number(
          (Number(updatedCampaign.collectedAmount) /
            Number(updatedCampaign.goalAmount)) *
            100
        );

        await prisma.campaign.update({
          where: { id: createdCampaign.id },
          data: {
            percentageFunded,
          },
        });
      }
    } else {
      console.log(`Campaign "${campaign.title}" already exists, skipping...`);
    }
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
