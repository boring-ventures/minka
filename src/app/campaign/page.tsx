import { CampaignGallery } from "@/components/views/campaign/CampaignGallery";
import { CampaignProgress } from "@/components/views/campaign/CampaignProgress";
import { CampaignDetails } from "@/components/views/campaign/CampaignDetails";
import { DonorComments } from "@/components/views/campaign/DonorComments";
import { Header } from "@/components/views/landing-page/Header";
import { Footer } from "@/components/views/landing-page/Footer";
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
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Campaign Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2c6e49] mb-4">
            Protejamos juntos el Parque Nacional Amboró
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
              Medio ambiente
            </span>
            <span>Santa Cruz, Bolivia</span>
            <span className="flex items-center gap-1">
              <Check size={16} className="text-green-600" />
              Verificado
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Left Column - Gallery */}
          <div className="lg:col-span-2">
            <CampaignGallery images={campaignData.images} />
          </div>

          {/* Right Column - Progress and Donation */}
          <div>
            <CampaignProgress {...campaignData.progress} />
          </div>
        </div>

        {/* Campaign Details */}
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

        {/* Related Campaigns */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-[#2c6e49] mb-6">
            Campañas relacionadas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={campaign.image}
                    alt={campaign.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-green-700 bg-green-50 px-2 py-1 rounded">
                      {campaign.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {campaign.location}
                    </span>
                  </div>
                  <h3 className="font-bold mb-2 line-clamp-2">
                    {campaign.title}
                  </h3>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${campaign.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {campaign.progress}% completado
                    </span>
                    <Link href={`/campaign?id=${campaign.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-700 hover:text-green-800 p-0"
                      >
                        Ver más <ArrowRight size={16} className="ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
