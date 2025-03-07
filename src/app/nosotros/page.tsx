"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const founders = [
  {
    name: "Marco Polo Sanchez",
    role: "Director co-founder",
    image: "/founders/marco-polo.jpg",
  },
  {
    name: "Rosalia Rivera Gonzales",
    role: "Co-founder",
    image: "/founders/rosalia-rivera.jpg",
  },
  {
    name: "Asad Abdula Mohamed",
    role: "Co-founder",
    image: "/founders/asad-abdula.jpg",
  },
  {
    name: "Rosa Mendoza",
    role: "Co-founder",
    image: "/founders/rosa-mendoza.jpg",
  },
  {
    name: "Carlos Gutierrez",
    role: "Tech Lead",
    image: "/founders/marco-polo.jpg",
  },
  {
    name: "Ana Martinez",
    role: "Marketing Director",
    image: "/founders/rosalia-rivera.jpg",
  },
  {
    name: "Luis Rodriguez",
    role: "Operations Manager",
    image: "/founders/asad-abdula.jpg",
  },
];

export default function NosotrosPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const totalSlides = Math.ceil(founders.length / 4);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const scrollToSlide = (slideIndex: number) => {
    if (!scrollContainerRef.current) return;

    const containerWidth = scrollContainerRef.current.clientWidth;
    const newPosition = slideIndex * containerWidth;

    scrollContainerRef.current.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });

    setActiveSlide(slideIndex);
  };

  const handlePrevSlide = () => {
    const newSlide = Math.max(activeSlide - 1, 0);
    scrollToSlide(newSlide);
  };

  const handleNextSlide = () => {
    const newSlide = Math.min(activeSlide + 1, totalSlides - 1);
    scrollToSlide(newSlide);
  };

  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Form submitted:", contactForm);
    // Reset form
    setContactForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-[#f5f7e9]">
      <main className="container mx-auto px-4 py-16">
        {/* Mission Statement Section */}
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-8">
            Impulsamos causas,
            <br />
            transformamos vidas
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            En Minka, creemos en el poder de la solidaridad para transformar
            vidas. Somos una plataforma de crowdfunding que conecta a quienes
            necesitan apoyo con personas dispuestas a ayudar, garantizando
            transparencia y seguridad en cada donación. Nuestro objetivo es
            brindar un espacio accesible y confiable donde cualquier causa,
            desde emergencias hasta proyectos de impacto social, pueda recibir
            el respaldo que merece.
          </p>
        </div>

        {/* Founders Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold mb-12">Los fundadores</h2>
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto pb-12 hide-scrollbar snap-x snap-mandatory"
            >
              <div className="flex gap-6 min-w-max px-4">
                {founders.map((founder) => (
                  <div
                    key={founder.name}
                    className="w-[280px] bg-[#2c6e49] rounded-2xl overflow-hidden snap-start"
                  >
                    <div className="h-[350px] relative">
                      <Image
                        src={founder.image}
                        alt={founder.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-white/80">{founder.role}</p>
                      <h3 className="text-lg font-medium text-white">
                        {founder.name}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white hover:bg-gray-100"
                aria-label="Previous slide"
                onClick={handlePrevSlide}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <div className="flex gap-2">
                {Array.from({ length: totalSlides }).map((_, i) => (
                  <button
                    key={`nav-dot-${i}`}
                    type="button"
                    className={`h-2 w-2 rounded-full ${
                      i === activeSlide ? "bg-[#2c6e49]" : "bg-[#2c6e49]/20"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => scrollToSlide(i)}
                  />
                ))}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white hover:bg-gray-100"
                aria-label="Next slide"
                onClick={handleNextSlide}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#f5f7e9] rounded-2xl overflow-hidden">
            {/* Left side - Illustration */}
            <div className="relative h-[400px] md:h-auto">
              <Image
                src="/contact-illustration.svg"
                alt="Personas colaborando"
                fill
                className="object-contain"
              />
            </div>

            {/* Right side - Contact Form */}
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-6">Contáctanos</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                  >
                    Nombre completo
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ingresa tu nombre"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    required
                    className="w-full rounded-md"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                  >
                    Correo electrónico
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nombre@correo.com"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                    className="w-full rounded-md"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-2"
                  >
                    Mensaje
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Ejemplo: Quiero apoyar esta campaña ¿Cómo lo hago?"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                    className="w-full rounded-md resize-none"
                    rows={4}
                  />
                  <div className="flex justify-end mt-1 text-xs text-gray-500">
                    {contactForm.message.length}/150
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-md py-2"
                >
                  Enviar
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Success Stories Section */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left side - Image */}
            <div className="rounded-2xl overflow-hidden">
              <Image
                src="/success-story.jpg"
                alt="Historia de éxito"
                width={600}
                height={500}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right side - Success Story */}
            <div className="bg-[#2c6e49] rounded-2xl p-8 text-white flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-4">
                Historia de éxito en website de Minka
              </h2>
              <p className="mb-10">
                Crea, comparte y logra tus metas de recaudación.
              </p>
              <p className="text-white/90 text-sm leading-relaxed">
                Crea, comparte y logra tus metas de recaudación. Crea, comparte
                y logra tus metas de recaudación. Crea, comparte y logra tus
                metas de recaudación. Crea, comparte y logra tus metas de
                recaudación. Crea, comparte y logra tus metas de recaudación.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Add this to your global CSS file
const styles = `
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`;
