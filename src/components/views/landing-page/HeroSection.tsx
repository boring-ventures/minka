import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-20 md:py-28">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#333333] mb-8">
          Impulsa sueños, transforma vidas
        </h1>
        <p className="text-xl md:text-2xl text-[#555555] mb-10">
          Conectamos a quienes anhelan recibir ayuda, con aquellos que quieren
          hacer sueños realidad, a través de una plataforma segura que facilita
          las donaciones.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link href="/sign-up">
            <Button className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full px-8 py-3 text-xl w-full sm:w-auto">
              Crear una campaña
            </Button>
          </Link>
          <Link href="/campaigns">
            <Button
              variant="outline"
              className="border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49] hover:text-white rounded-full px-8 py-3 text-xl w-full sm:w-auto"
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

