"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function StartCampaignSection() {
  return (
    <section className="relative w-full min-h-[80vh] flex items-center overflow-hidden bg-[#f5f7e9]">
      {/* Background SVG covering the screen width */}
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

      <div className="container mx-auto px-4 py-16 relative z-10">
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
    </section>
  );
}
