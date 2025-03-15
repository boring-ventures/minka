"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

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
        <p className="text-xl text-[#555555] max-w-3xl mx-auto">
          Conoce las causas o campañas que están activas transformando vidas ¡y
          haz la diferencia con tu aporte!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-white rounded-lg overflow-hidden group relative transition-all duration-300"
          >
            {/* Campaign Image - Always visible but partially covered */}
            <div className="relative h-56">
              <Image
                src={campaign.image}
                alt={campaign.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Default Card Content */}
            <div className="p-6 bg-white transition-all duration-300 group-hover:bg-white/80 group-hover:backdrop-blur-sm">
              <div className="flex flex-col mb-3">
                <div className="mb-2 flex-shrink-0">
                  <Image
                    src="/landing-page/step-2.png"
                    alt="Verified"
                    width={32}
                    height={32}
                    className="text-[#2c6e49]"
                  />
                </div>
                <h3 className="font-medium text-2xl text-[#2c6e49]">
                  {campaign.title}
                </h3>
              </div>
              <div className="flex items-center text-base text-gray-600 mb-4">
                <span className="mr-4">{campaign.category}</span>
                <span>{campaign.location}</span>
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
                <Button className="w-full bg-white text-[#2c6e49] hover:bg-[#2c6e49] hover:text-white text-lg shadow-none border-0">
                  Donar ahora <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Hover State Content */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm p-6 flex flex-col opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
              <div className="flex flex-col mb-3">
                <div className="mb-2 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#2c6e49] flex items-center justify-center">
                    <Image
                      src="/landing-page/step-2.png"
                      alt="Verified"
                      width={32}
                      height={32}
                      className="brightness-0 invert"
                    />
                  </div>
                </div>
                <h3 className="font-medium text-2xl text-[#2c6e49]">
                  {campaign.title}
                </h3>
              </div>

              <div className="flex items-center text-base text-gray-600 mb-3">
                <span className="mr-4">{campaign.category}</span>
                <span>{campaign.location}</span>
              </div>

              <p className="text-gray-600 mb-4 flex-grow">
                {campaign.description}
              </p>

              <div className="flex justify-between text-gray-600 mb-3">
                <div>
                  <p className="font-medium">Donadores</p>
                  <p className="text-xl font-bold">{campaign.donorCount}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Recaudado</p>
                  <p className="text-xl font-bold">{campaign.amountRaised}</p>
                </div>
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
                <Button className="w-full bg-[#2c6e49] text-white hover:bg-[#1e4d33] text-lg shadow-none border-0">
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
            className="bg-white text-[#2c6e49] hover:bg-[#2c6e49] hover:text-white text-xl shadow-none border-0"
            size="lg"
          >
            Ver campañas <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
