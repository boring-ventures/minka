"use client";

import Image from "next/image";

const steps = [
  {
    id: "step-1",
    icon: "/landing-page/step-1.svg",
    label: "Crea tu campaña",
  },
  {
    id: "step-2",
    icon: "/landing-page/step-2.png",
    label: "Verificala",
  },
  {
    id: "step-3",
    icon: "/landing-page/step-3.svg",
    label: "Compártela",
  },
  {
    id: "step-4",
    icon: "/landing-page/step-4.svg",
    label: "Gestiona los fondos",
  },
];

export function CreateCampaignHeader() {
  return (
    <div className="relative py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-600 mb-4">
            Personaliza tu campaña y comparte tu historia de forma gratuita.
          </h2>
          <p className="text-lg md:text-xl text-gray-600">
            Sigue estos simples pasos y empieza a recaudar fondos.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Mobile view - Vertical steps */}
          <div className="md:hidden">
            <div className="relative flex flex-col space-y-8 px-4">
              {/* Vertical connecting line */}
              <div
                className="absolute w-[2px] bg-[#478C5C]"
                style={{
                  left: "30px",
                  top: "30px",
                  bottom: "30px",
                  transform: "translateX(-50%)",
                }}
              ></div>

              {/* Steps */}
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="w-[60px] h-[60px] rounded-full bg-white border-2 border-[#478C5C] flex items-center justify-center z-10 relative">
                    <Image
                      src={step.icon}
                      alt={step.label}
                      width={32}
                      height={32}
                    />
                  </div>
                  <div className="ml-4">
                    <span className="text-base font-medium text-gray-700">
                      {step.label}
                    </span>
                    {index === 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        Estás en este paso actualmente
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop view - Horizontal steps */}
          <div className="hidden md:block">
            <div className="relative flex items-center justify-between">
              {/* Connecting line */}
              <div
                className="absolute h-[2px] bg-[#478C5C]"
                style={{
                  left: "calc(60px)",
                  right: "calc(60px)",
                  top: "30px",
                }}
              ></div>

              {/* Steps */}
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="flex flex-col items-center justify-start"
                >
                  <div className="w-[60px] h-[60px] rounded-full bg-white border-2 border-[#478C5C] flex items-center justify-center mb-4 z-10 relative">
                    <Image
                      src={step.icon}
                      alt={step.label}
                      width={32}
                      height={32}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 text-center">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
