"use client";

import { CategorySelector } from "@/components/views/campaigns/CategorySelector";
import { FilterSidebar } from "@/components/views/campaigns/FilterSidebar";
import { CampaignCard } from "@/components/views/campaigns/CampaignCard";
import { Header } from "@/components/views/landing-page/Header";
import { Footer } from "@/components/views/landing-page/Footer";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const mockCampaigns = [
  {
    id: "camp-001",
    title: "Protejamos juntos el Parque Nacional Amboró",
    image: "/landing-page/dummies/Card/Imagen.png",
    category: "Medio ambiente",
    location: "Santa Cruz",
    progress: 80,
    verified: true,
    description:
      "El Parque Nacional Amboró es uno de los lugares más biodiversos del mundo, hogar de especies únicas y ecosistemas vitales. Su conservación depende de todos nosotros.",
    donorCount: 250,
    amountRaised: "Bs. 1.200,00",
  },
  {
    id: "camp-002",
    title: "Educación para niños en zonas rurales",
    image: "/landing-page/dummies/Card/Imagen.png",
    category: "Educación",
    location: "La Paz",
    progress: 65,
    verified: true,
    description:
      "Ayúdanos a llevar educación de calidad a niños en zonas rurales de Bolivia que no tienen acceso a escuelas o materiales educativos adecuados.",
    donorCount: 180,
    amountRaised: "Bs. 950,00",
  },
  {
    id: "camp-003",
    title: "Apoyo a artesanos locales",
    image: "/landing-page/dummies/Card/Imagen.png",
    category: "Cultura y arte",
    location: "Cochabamba",
    progress: 45,
    verified: false,
    description:
      "Apoya a los artesanos locales para preservar técnicas tradicionales y promover el desarrollo económico sostenible en comunidades rurales.",
    donorCount: 120,
    amountRaised: "Bs. 750,00",
  },
  {
    id: "camp-004",
    title: "Centro de salud para comunidad indígena",
    image: "/landing-page/dummies/Card/Imagen.png",
    category: "Salud",
    location: "Beni",
    progress: 90,
    verified: true,
    description:
      "Ayuda a construir un centro de salud para comunidades indígenas que actualmente deben viajar largas distancias para recibir atención médica básica.",
    donorCount: 320,
    amountRaised: "Bs. 1.800,00",
  },
  {
    id: "camp-005",
    title: "Reforestación en la Amazonía",
    image: "/landing-page/dummies/Card/Imagen.png",
    category: "Medio ambiente",
    location: "Pando",
    progress: 30,
    verified: true,
    description:
      "Contribuye a nuestro proyecto de reforestación en la Amazonía boliviana para combatir la deforestación y proteger el pulmón del planeta.",
    donorCount: 95,
    amountRaised: "Bs. 450,00",
  },
  {
    id: "camp-006",
    title: "Empoderamiento de mujeres emprendedoras",
    image: "/landing-page/dummies/Card/Imagen.png",
    category: "Igualdad",
    location: "Santa Cruz",
    progress: 75,
    verified: true,
    description:
      "Apoya a mujeres emprendedoras de comunidades vulnerables con capacitación y microcréditos para iniciar sus propios negocios sostenibles.",
    donorCount: 210,
    amountRaised: "Bs. 1.050,00",
  },
];

type SortOption = {
  id: string;
  label: string;
};

const sortOptions: SortOption[] = [
  { id: "popular", label: "Más populares" },
  { id: "nearby", label: "Cerca a ti" },
  { id: "ongs", label: "ONGs" },
];

export default function CampaignsPage() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>(sortOptions[0]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectOption = (option: SortOption) => {
    setSelectedSort(option);
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f7e9]">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#333333] mb-6">
            Apoya una causa,
            <br />
            cambia una vida
          </h1>
          <p className="text-2xl md:text-3xl text-[#555555] max-w-3xl mx-auto mb-12">
            Explora todas las campañas activas o encuentra las de tu interés
            según categoría.
          </p>
        </div>

        <CategorySelector />

        <div className="flex flex-col md:flex-row gap-10 mt-16">
          <FilterSidebar />

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-[#333333]">
                  Todas las campañas
                </h2>
                <p className="text-xl text-[#555555]">148 Resultados</p>
              </div>

              <div className="relative mt-4 sm:mt-0">
                <div className="flex items-center">
                  <span className="mr-3 text-[#555555] font-medium">
                    Ordenar por:
                  </span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={toggleDropdown}
                      className="flex items-center justify-between bg-transparent py-2 px-4 min-w-[160px] text-[#333333] font-medium focus:outline-none"
                    >
                      <span>{selectedSort.label}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-600 ml-2 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-sm z-10">
                        {sortOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => selectOption(option)}
                            className={`block w-full text-left px-4 py-2 hover:bg-[#e9ebd8] ${
                              selectedSort.id === option.id
                                ? "text-[#2c6e49] font-medium"
                                : "text-[#333333]"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mockCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  title={campaign.title}
                  image={campaign.image}
                  category={campaign.category}
                  location={campaign.location}
                  progress={campaign.progress}
                  verified={campaign.verified}
                  description={campaign.description}
                  donorCount={campaign.donorCount}
                  amountRaised={campaign.amountRaised}
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
