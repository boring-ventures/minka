"use client";

import Image from "next/image";

const steps = [
  {
    id: "step-1",
    icon: "/views/create-campaign/create-campaign.svg",
    label: "Crea tu campaña",
  },
  {
    id: "step-2",
    icon: "/views/create-campaign/verified.svg",
    label: "Verificala",
  },
  {
    id: "step-3",
    icon: "/views/create-campaign/handshake.svg",
    label: "Compártela",
  },
  {
    id: "step-4",
    icon: "/views/create-campaign/digital_wellbeing.svg",
    label: "Gestiona los fondos",
  },
];

export function CreateCampaignHeader() {
  return (
    <div className="relative bg-white py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-2xl text-gray-600 mb-4">
            Personaliza tu campaña y comparte tu historia de forma gratuita.
          </h2>
          <p className="text-xl text-gray-600">
            Sigue estos simples pasos y empieza a recaudar fondos.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
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
                <div className="w-[60px] h-[60px] bg-white rounded-full border-2 border-[#478C5C] flex items-center justify-center mb-4 z-10 relative">
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
  );
}
