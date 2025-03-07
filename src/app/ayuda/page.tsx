"use client";

import { useState } from "react";
import { Search, Plus, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";

// FAQ data structure
type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

const faqData: FAQItem[] = [
  {
    id: "faq-1",
    question: "¿Qué es Minka?",
    answer: "",
  },
  {
    id: "faq-2",
    question: "¿Cómo sé que una campaña es confiable?",
    answer: "",
  },
  {
    id: "faq-3",
    question: "¿Minka cobra alguna comisión?",
    answer:
      "Sí. Minka retiene un 5% de cada donación para cubrir costos operativos y garantizar el buen funcionamiento de la plataforma.",
  },
  {
    id: "faq-4",
    question: "¿Puedo donar cualquier monto?",
    answer: "",
  },
  {
    id: "faq-5",
    question: "¿Cómo puedo crear una campaña en Minka?",
    answer: "",
  },
];

export default function AyudaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFAQs, setOpenFAQs] = useState<string[]>(["faq-3"]); // Default open the third FAQ

  const toggleFAQ = (id: string) => {
    setOpenFAQs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFAQs = faqData.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f5f7e9]">
      <div className="w-full pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-screen-xl">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-[#2c6e49] mb-16 text-center">
              ¿Cómo podemos ayudarte?
            </h1>

            {/* Search Bar */}
            <div className="relative mb-16">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Dejar consultas aquí..."
                className="pl-12 py-6 rounded-full border-gray-200 w-full h-14 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-0">
              {filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="border-t border-gray-200 last:border-b"
                >
                  <button
                    type="button"
                    className="flex justify-between items-center w-full py-6 text-left"
                    onClick={() => toggleFAQ(faq.id)}
                    aria-expanded={openFAQs.includes(faq.id)}
                  >
                    <h3 className="text-xl font-medium text-[#2c6e49]">
                      {faq.question}
                    </h3>
                    <div className="text-[#2c6e49]">
                      {openFAQs.includes(faq.id) ? (
                        <Minus className="h-6 w-6" />
                      ) : (
                        <Plus className="h-6 w-6" />
                      )}
                    </div>
                  </button>
                  {openFAQs.includes(faq.id) && (
                    <div className="pb-6">
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Customer Service Section */}
            <div className="mt-24">
              <h2 className="text-3xl font-bold text-[#2c6e49] mb-6">
                Atención al cliente
              </h2>
              <div className="bg-[#e8f0e9] rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <button
                  type="button"
                  className="flex items-center gap-2 text-[#2c6e49] font-medium"
                >
                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </span>
                  Contáctanos por Messenger
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 text-[#2c6e49] font-medium"
                >
                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  Escríbenos por correo electrónico
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 text-[#2c6e49] font-medium"
                >
                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </span>
                  Contáctanos por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
