import Image from "next/image"

export function PartnersSection() {
  return (
    <section className="bg-[#f5f7e9] py-24 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-[#333333] text-center mb-16 animate-slide-up">Nuestros aliados</h2>

        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
          <a href="#" className="group">
            <Image
              src="https://v0.blob.com/forbes.svg"
              alt="Forbes"
              width={160}
              height={60}
              className="h-12 w-auto partner-logo group-hover:scale-105"
            />
          </a>
          <a href="#" className="group">
            <Image
              src="https://v0.blob.com/globalgiving.svg"
              alt="GlobalGiving"
              width={160}
              height={60}
              className="h-12 w-auto partner-logo group-hover:scale-105"
            />
          </a>
          <a href="#" className="group">
            <Image
              src="https://v0.blob.com/unil.svg"
              alt="UNIL"
              width={160}
              height={60}
              className="h-12 w-auto partner-logo group-hover:scale-105"
            />
          </a>
          <a href="#" className="group">
            <Image
              src="https://v0.blob.com/paypal.svg"
              alt="PayPal"
              width={160}
              height={60}
              className="h-12 w-auto partner-logo group-hover:scale-105"
            />
          </a>
          <a href="#" className="group">
            <Image
              src="https://v0.blob.com/alliance.svg"
              alt="Banking Alliance"
              width={160}
              height={60}
              className="h-12 w-auto partner-logo group-hover:scale-105"
            />
          </a>
        </div>
      </div>
    </section>
  )
}

