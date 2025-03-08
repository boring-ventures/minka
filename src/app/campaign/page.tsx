import { CampaignGallery } from "@/components/views/campaign/CampaignGallery";
import { CampaignProgress } from "@/components/views/campaign/CampaignProgress";
import { CampaignDetails } from "@/components/views/campaign/CampaignDetails";
import { DonorComments } from "@/components/views/campaign/DonorComments";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

// Mock data for related campaigns
const relatedCampaigns = [
  {
    id: 1,
    title: "Educación para niños en zonas rurales",
    image: "/education-campaign.jpg",
    category: "Educación",
    location: "La Paz",
    progress: 65,
  },
  {
    id: 2,
    title: "Apoyo a artesanos locales",
    image: "/artisans-campaign.jpg",
    category: "Cultura y arte",
    location: "Cochabamba",
    progress: 45,
  },
  {
    id: 3,
    title: "Centro de salud para comunidad indígena",
    image: "/health-campaign.jpg",
    category: "Salud",
    location: "Beni",
    progress: 90,
  },
];

// This would come from your API/database
const campaignData = {
  title: "Protejamos juntos el Parque Nacional Amboró",
  description:
    "El Parque Nacional Amboró es un tesoro natural incomparable, reconocido como uno de los lugares más biodiversos del planeta. En sus exuberantes paisajes, alberga especies únicas de flora y fauna que dependen de este ecosistema para sobrevivir. Sin embargo, esta riqueza está amenazada por la deforestación, la caza furtiva y otros riesgos ambientales.\n\nTu contribución será destinada a proyectos que restauren y protejan los hábitats del parque, implementen programas de vigilancia y promuevan la educación ambiental en las comunidades locales. ¡Únete a nosotros para marcar la diferencia!",
  beneficiaries:
    "Los fondos recaudados apoyarán iniciativas lideradas por organizaciones especializadas en conservación ambiental, además de beneficiar directamente a las comunidades que rodean el parque, promoviendo prácticas sostenibles y una convivencia armoniosa con la naturaleza.",
  images: [
    { url: "/campaign/amboro-main.jpg", type: "image" as const, id: "img-1" },
    {
      url: "/campaign/amboro-secondary.jpg",
      type: "image" as const,
      id: "img-2",
    },
    { url: "/campaign/amboro-video.jpg", type: "video" as const, id: "vid-1" },
  ],
  progress: {
    isVerified: true,
    createdAt: "6 días",
    currentAmount: 1200,
    targetAmount: 4000,
    donorsCount: 250,
  },
  organizer: {
    name: "Andrés Martínez Saucedo",
    role: "Organizador de campaña",
    location: "Santa Cruz de la Sierra, Bolivia",
    memberSince: "2023",
    successfulCampaigns: 2,
    bio: "Soy un activista ambiental comprometido con la conservación de la biodiversidad. Trabajo con comunidades locales para promover la sostenibilidad.",
  },
  comments: [
    {
      donor: "Nadia Rosas",
      amount: 200,
      date: "3 días",
      comment:
        "Es un honor poder contribuir a la conservación del Parque Nacional Amboró. ¡Juntos podemos hacer la diferencia! Sigamos protegiendo este maravilloso lugar",
    },
    {
      donor: "Carlos Mendoza",
      amount: 150,
      date: "4 días",
      comment:
        "Excelente iniciativa para proteger nuestro patrimonio natural. Espero que más personas se unan a esta causa.",
    },
    {
      donor: "María Valencia",
      amount: 300,
      date: "5 días",
      comment:
        "Como bióloga, sé lo importante que es preservar estos ecosistemas. Gracias por liderar esta campaña.",
    },
  ],
};

export default function CampaignPage() {
  return (
    <div className="min-h-screen bg-[#f5f7e9]">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center mb-6">
            {campaignData.title}
          </h1>
          <p className="text-center text-gray-600 text-xl">
            El Parque Nacional Amboró es uno de los lugares más biodiversos del
            mundo, hogar de especies únicas y ecosistemas vitales. Su
            conservación depende de todos nosotros.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <CampaignGallery images={campaignData.images} />
          </div>
          <div>
            <CampaignProgress {...campaignData.progress} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <CampaignDetails
              organizer={campaignData.organizer}
              description={campaignData.description}
              beneficiaries={campaignData.beneficiaries}
            />
            <div className="mt-12">
              <DonorComments comments={campaignData.comments} />
            </div>
          </div>
        </div>

        <section className="py-16">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-6">
            Únete a otras causas
          </h2>
          <p className="text-center text-gray-600 text-xl mb-12">
            Juntos hacemos la diferencia ¡Apoya una campaña hoy!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {relatedCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white rounded-lg overflow-hidden shadow-md"
              >
                <div className="relative h-56">
                  <Image
                    src={campaign.image}
                    alt={campaign.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <Check className="h-6 w-6 text-[#2c6e49] mr-3" />
                    <h3 className="font-medium text-2xl text-[#2c6e49]">
                      {campaign.title}
                    </h3>
                  </div>
                  <div className="flex items-center text-base text-gray-600 mb-4">
                    <span className="mr-4">{campaign.category}</span>
                    <span>Bolivia, {campaign.location}</span>
                  </div>
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-[#2c6e49] h-3 rounded-full"
                        style={{ width: `${campaign.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-end mt-2">
                      <span className="text-base text-gray-600">
                        {campaign.progress}%
                      </span>
                    </div>
                  </div>
                  <Link href="/campaigns" className="block">
                    <Button
                      variant="outline"
                      className="w-full border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49] hover:text-white text-lg"
                    >
                      Donar ahora <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Link href="/campaigns">
              <Button
                variant="outline"
                className="border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49] hover:text-white text-xl"
                size="lg"
              >
                Ver más campañas <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
