import Image from "next/image"

export function PartnersSection() {
  const allies = [
    {
      name: "Rainforest Alliance",
      logo: "/allies/rainforest-alliance.png",
      href: "https://www.rainforest-alliance.org/",
    },
    {
      name: "Forbes",
      logo: "/allies/forbes.png",
      href: "https://www.forbes.com/",
    },
    {
      name: "GlobalGiving",
      logo: "/allies/globalgiving.png",
      href: "https://www.globalgiving.org/",
    },
    {
      name: "UNIL HUB",
      logo: "/allies/unil-hub.png",
      href: "https://www.unil.ch/",
    },
    {
      name: "PayPal",
      logo: "/allies/paypal.png",
      href: "https://www.paypal.com/",
    },
  ];

  return (
    <section className="bg-[#f5f7e9] py-24 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-[#333333] text-center mb-16 animate-slide-up">
          Nuestros aliados
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 items-center max-w-6xl mx-auto">
          {allies.map((ally) => (
            <a
              key={ally.name}
              href={ally.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center h-24"
              title={`Visitar ${ally.name}`}
            >
              <div className="relative w-full h-full flex items-center justify-center px-4">
                <Image
                  src={ally.logo}
                  alt={`Logo de ${ally.name}`}
                  fill
                  className="object-contain partner-logo group-hover:scale-105"
                  sizes="(max-width: 768px) 40vw, (max-width: 1024px) 25vw, 20vw"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

