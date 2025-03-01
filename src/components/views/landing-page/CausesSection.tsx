import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check } from "lucide-react"

export function CausesSection() {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-[#333333] mb-6">Causas que inspiran</h2>
        <p className="text-xl text-[#555555] max-w-3xl mx-auto">
          Conoce las causas o campañas que están activas transformando vidas ¡y haz la diferencia con tu aporte!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-white rounded-lg overflow-hidden shadow-md">
            <div className="relative h-56">
              <Image src="/amboro-campaign.jpg" alt="Parque Nacional Amboró" fill className="object-cover" />
            </div>
            <div className="p-6">
              <div className="flex items-center mb-3">
                <Check className="h-6 w-6 text-[#2c6e49] mr-3" />
                <h3 className="font-medium text-xl text-[#2c6e49]">Protejamos juntos el Parque Nacional Amboró</h3>
              </div>
              <div className="flex items-center text-base text-gray-600 mb-4">
                <span className="mr-4">Medio ambiente</span>
                <span>Bolivia, Santa Cruz</span>
              </div>
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-[#2c6e49] h-3 rounded-full" style={{ width: "80%" }}></div>
                </div>
                <div className="flex justify-end mt-2">
                  <span className="text-base text-gray-600">80%</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49] hover:text-white rounded-full text-lg py-3"
              >
                Donar ahora <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          className="border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49] hover:text-white rounded-full text-xl px-8 py-3"
        >
          Ver campañas <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>
  )
}

