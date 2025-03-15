"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function StartCampaignSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(-1); // Start with -1 to show intro first
  const [isScrolled, setIsScrolled] = useState(false);

  // Campaign steps data
  const campaignSteps = [
    {
      id: "create",
      step: "01",
      icon: "/landing-page/step-1.svg",
      title: "Crea tu campaña",
      description:
        "Establece tu meta y cuenta tu historia para inspirar a más personas.",
      buttonText: "Crear campaña",
      buttonLink: "/create-campaign",
    },
    {
      id: "verify",
      step: "02",
      icon: "/landing-page/step-2.svg",
      title: "Verifica tu campaña",
      description:
        "Completa este proceso para garantizar confianza y transparencia.",
      buttonText: "Crear campaña",
      buttonLink: "/create-campaign",
    },
    {
      id: "share",
      step: "03",
      icon: "/landing-page/step-3.svg",
      title: "Comparte tu campaña",
      description: "Difunde tu causa y atrae el apoyo que necesitas.",
      buttonText: "Crear campaña",
      buttonLink: "/create-campaign",
    },
    {
      id: "manage",
      step: "04",
      icon: "/landing-page/step-4.svg",
      title: "Gestiona y retira los fondos",
      description:
        "Utiliza los fondos recaudados para hacer realidad tu propósito.",
      buttonText: "Crear campaña",
      buttonLink: "/create-campaign",
    },
  ];

  // Handle scroll to update active step
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const sectionRect = sectionRef.current.getBoundingClientRect();
      const sectionTop = sectionRect.top;
      const sectionHeight = sectionRef.current.offsetHeight;
      const windowHeight = window.innerHeight;

      // Hide scroll prompt after user has started scrolling
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // If section is not yet in view, reset to intro
      if (sectionTop > windowHeight) {
        setActiveStep(-1);
        return;
      }

      // If section is completely scrolled past, keep at last step
      if (sectionTop + sectionHeight < 0) {
        setActiveStep(campaignSteps.length - 1);
        return;
      }

      // Calculate progress through the section (0 to 1)
      // We use the section's position relative to the viewport to determine progress
      const visibleHeight = Math.min(windowHeight, sectionHeight);
      const totalScrollableDistance = sectionHeight - visibleHeight;

      // How far we've scrolled into the section (normalized from 0 to 1)
      const scrollProgress = Math.max(
        0,
        Math.min(1, -sectionTop / totalScrollableDistance)
      );

      // Map progress to steps (-1 for intro, then 0 to 3 for the steps)
      const numStates = campaignSteps.length + 1; // +1 for intro
      const stepProgress = scrollProgress * numStates;

      // Set active step based on progress
      const newActiveStep = Math.min(
        Math.floor(stepProgress) - 1, // -1 adjusts for intro step
        campaignSteps.length - 1
      );

      setActiveStep(newActiveStep);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initialize on mount

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full h-[400vh]">
      {/* Content container - sticky positioned to follow scroll */}
      <div className="sticky top-0 left-0 w-full h-screen flex items-center justify-center overflow-hidden bg-[#f5f7e9]">
        {/* Background SVG */}
        <div className="absolute bottom-0 left-0 right-0 z-0">
          <Image
            src="/auth/auth-bg.svg"
            alt="Background with plants"
            width={1440}
            height={535}
            priority
            className="h-auto w-full"
          />
        </div>

        {/* Scroll down prompt */}
        <div
          className={`absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20 transition-opacity duration-500 ${
            isScrolled ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex flex-col items-center">
            <p className="text-[#2c6e49] font-medium mb-2">
              Desplázate para descubrir
            </p>
            <div className="animate-bounce bg-[#2c6e49] rounded-full p-2">
              <ChevronDown className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Intro section */}
        <div
          className={`absolute top-0 left-0 w-full h-full flex items-center justify-center transition-opacity duration-500 z-10 ${
            activeStep === -1 ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-[#2c6e49] text-2xl font-medium mb-4 block">
                ¿Tienes una causa que necesita apoyo?
              </span>
              <h2 className="text-6xl md:text-7xl font-bold text-[#333333] mb-6 leading-tight text-center">
                ¡Inicia tu campaña!
              </h2>
              <p className="text-xl text-[#555555] mb-10 max-w-2xl mx-auto">
                Sigue estos sencillos pasos y empieza a recibir la ayuda que tu
                proyecto merece.
              </p>
              <Link href="/create-campaign">
                <Button
                  className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white text-xl font-medium group"
                  size="lg"
                >
                  Crear campaña
                  <ArrowRight className="ml-2 h-6 w-6 inline-block transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Step sections */}
        {campaignSteps.map((step) => (
          <div
            key={step.id}
            className={`absolute top-0 left-0 w-full h-full flex items-center justify-center transition-opacity duration-500 z-10 ${
              activeStep === campaignSteps.findIndex((s) => s.id === step.id)
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                {/* Step icon */}
                <div className="mb-4">
                  <Image
                    src={step.icon}
                    alt={`Step ${step.step} icon`}
                    width={64}
                    height={64}
                    className="mx-auto"
                  />
                </div>

                {/* Step number */}
                <p className="text-[#2c6e49] text-lg font-medium mb-2">
                  PASO {step.step}
                </p>

                {/* Step title */}
                <h2 className="text-5xl md:text-6xl font-bold text-[#333333] mb-4 leading-tight">
                  {step.title}
                </h2>

                {/* Step description */}
                <p className="text-xl text-[#555555] mb-8 max-w-2xl mx-auto">
                  {step.description}
                </p>

                {/* Step button */}
                <Link href={step.buttonLink}>
                  <Button
                    className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white font-medium group"
                    size="lg"
                  >
                    {step.buttonText}
                    <ArrowRight className="ml-2 h-5 w-5 inline-block transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
