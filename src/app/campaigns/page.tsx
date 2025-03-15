import { CategorySelector } from "@/components/views/campaigns/CategorySelector";
import { FilterSidebar } from "@/components/views/campaigns/FilterSidebar";
import { CampaignCard } from "@/components/views/campaigns/CampaignCard";
import { Header } from "@/components/views/landing-page/Header";
import { Footer } from "@/components/views/landing-page/Footer";

const mockCampaigns = [
  {
    id: "camp-001",
    title: "Protejamos juntos el Parque Nacional Amboró",
    image: "/amboro-campaign.jpg",
    category: "Medio ambiente",
    location: "Santa Cruz",
    progress: 80,
    verified: true,
  },
  {
    id: "camp-002",
    title: "Educación para niños en zonas rurales",
    image: "/education-campaign.jpg",
    category: "Educación",
    location: "La Paz",
    progress: 65,
    verified: true,
  },
  {
    id: "camp-003",
    title: "Apoyo a artesanos locales",
    image: "/artisans-campaign.jpg",
    category: "Cultura y arte",
    location: "Cochabamba",
    progress: 45,
    verified: false,
  },
  {
    id: "camp-004",
    title: "Centro de salud para comunidad indígena",
    image: "/health-campaign.jpg",
    category: "Salud",
    location: "Beni",
    progress: 90,
    verified: true,
  },
  {
    id: "camp-005",
    title: "Reforestación en la Amazonía",
    image: "/forest-campaign.jpg",
    category: "Medio ambiente",
    location: "Pando",
    progress: 30,
    verified: true,
  },
  {
    id: "camp-006",
    title: "Empoderamiento de mujeres emprendedoras",
    image: "/women-campaign.jpg",
    category: "Igualdad",
    location: "Santa Cruz",
    progress: 75,
    verified: true,
  },
];

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-[#f5f7e9]">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#2c6e49] mb-8">
          Campañas activas
        </h1>

        <CategorySelector />

        <div className="flex flex-col md:flex-row gap-8 mt-8">
          <FilterSidebar />

          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  title={campaign.title}
                  image={campaign.image}
                  category={campaign.category}
                  location={campaign.location}
                  progress={campaign.progress}
                  verified={campaign.verified}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
