"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-20 md:py-28">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
          Juntos podemos <br /> hacer la diferencia
        </h1>
        <p className="text-2xl md:text-3xl mb-10 max-w-2xl">
          Minka es la plataforma boliviana que conecta causas importantes con
          personas que quieren ayudar.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link href="/create-campaign">
            <Button
              className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white text-xl w-full sm:w-auto rounded-full"
              size="lg"
            >
              Crear una campaña
            </Button>
          </Link>
          <Link href="/campaigns">
            <Button
              variant="outline"
              className="border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49] hover:text-white text-xl w-full sm:w-auto rounded-full"
              size="lg"
            >
              Donar <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex justify-center">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Home-NGwlOMn4tqq2NFWU5hMqqcgTWQcUmi.svg"
          alt="Personas diversas"
          width={800}
          height={400}
          className="w-full max-w-4xl"
        />
      </div>
    </section>
  );
}
