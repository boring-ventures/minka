import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function StartCampaignSection() {
  return (
    <section className="relative w-full min-h-[80vh] flex items-center overflow-hidden">
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-[#2c6e49] text-2xl font-medium mb-4 block">¿Tienes una causa que necesita apoyo?</span>
          <h2 className="text-5xl md:text-6xl font-bold text-[#333333] mb-6 leading-tight text-center">¡Inicia tu campaña!</h2>
          <p className="text-xl text-[#555555] mb-10 max-w-2xl mx-auto">
            Sigue estos sencillos pasos y empieza a recibir la ayuda que tu proyecto merece.
          </p>
          <Button className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full h-14 px-8 text-xl font-medium group">
            Crear campaña
            <ArrowRight className="ml-2 h-6 w-6 inline-block transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>

      {/* Background Images */}
      <div className="absolute bottom-0 left-0 w-[541px] z-0">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bushes-NKKZS522gupwFIzzHDRnVvddBZlT0K.svg"
          alt="Background bushes"
          width={541}
          height={540}
          className="w-full"
          priority
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-[1]">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/llama-dTq3LY2686U144YpUEJy0gWR2xB2P9.svg"
          alt="Inicia tu campaña"
          width={1920}
          height={972}
          className="w-full"
          priority
        />
      </div>
    </section>
  )
}

