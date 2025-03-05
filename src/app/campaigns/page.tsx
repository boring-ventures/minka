import { CategorySelector } from "@/components/views/campaigns/CategorySelector";
import { FilterSidebar } from "@/components/views/campaigns/FilterSidebar";
import { CampaignCard } from "@/components/views/campaigns/CampaignCard";

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

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center mb-6">
            Apoya una causa, cambia una vida
          </h1>
          <p className="text-center text-gray-600 text-xl">
            Explora todas las campañas activas o encuentra las de tu interés con
            nuestro buscador
          </p>
        </div>

        <div className="mb-12">
          <CategorySelector />
        </div>

        <div className="flex gap-12">
          <FilterSidebar />

          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <h2 className="font-medium text-xl">Todas las campañas</h2>
                <span className="text-sm text-gray-500">
                  {mockCampaigns.length} Resultados
                </span>
              </div>
              <select className="form-select rounded-md border-gray-300 text-sm">
                <option>Más populares</option>
                <option>Más recientes</option>
                <option>Mayor progreso</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
    </div>
  );
}
