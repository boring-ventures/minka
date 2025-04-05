"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CampaignCard } from "@/components/views/campaigns/CampaignCard";

export function CausesSection() {
  const campaigns = [
    {
      id: 1,
      title: "Protejamos juntos el Parque Nacional Amboró",
      description:
        "El Parque Nacional Amboró es uno de los lugares más biodiversos del mundo, hogar de especies únicas y ecosistemas vitales. Su conservación depende de todos nosotros.",
      image: "/landing-page/dummies/Card/Imagen.png",
      category: "Medio ambiente",
      location: "Bolivia, Santa Cruz",
      progress: 80,
      donorCount: 250,
      amountRaised: "Bs. 1.200,00",
    },
    {
      id: 2,
      title: "Educación para niños en zonas rurales",
      description:
        "Ayúdanos a llevar educación de calidad a niños en zonas rurales de Bolivia que no tienen acceso a escuelas o materiales educativos adecuados.",
      image: "/landing-page/dummies/Card/Imagen.png",
      category: "Educación",
      location: "Bolivia, Cochabamba",
      progress: 65,
      donorCount: 180,
      amountRaised: "Bs. 950,00",
    },
    {
      id: 3,
      title: "Agua potable para comunidades aisladas",
      description:
        "Contribuye a nuestro proyecto para instalar sistemas de agua potable en comunidades aisladas que actualmente no tienen acceso a agua limpia y segura.",
      image: "/landing-page/dummies/Card/Imagen.png",
      category: "Salud",
      location: "Bolivia, La Paz",
      progress: 45,
      donorCount: 120,
      amountRaised: "Bs. 750,00",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h2 className="text-6xl md:text-7xl font-bold text-[#333333] mb-6 text-center">
          Causas que inspiran
        </h2>
        <p className="text-2xl md:text-3xl text-[#555555] max-w-3xl mx-auto">
          Conoce las causas o campañas que están activas transformando vidas ¡y
          haz la diferencia con tu aporte!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            id={campaign.id}
            title={campaign.title}
            image={campaign.image}
            category={campaign.category}
            location={campaign.location}
            progress={campaign.progress}
            verified={true}
            description={campaign.description}
            donorCount={campaign.donorCount}
            amountRaised={campaign.amountRaised}
          />
        ))}
      </div>

      <div className="flex justify-center mt-12">
        <Link href="/campaign">
          <Button
            className="bg-[#2c6e49] text-white hover:bg-[#1e4d33] hover:text-white text-xl shadow-none border-0 rounded-full"
            size="lg"
          >
            Ver más campañas <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
