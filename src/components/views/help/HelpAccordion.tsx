"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqItems = [
  {
    id: "faq-1",
    question: "¿Qué es Minka?",
    answer:
      "La verificación aumenta la confianza de los donadores y asegura la transparencia de tu causa.",
  },
  {
    id: "faq-2",
    question: "¿Cómo sé que una campaña es confiable?",
    answer:
      "Todas las campañas pasan por un proceso de verificación donde validamos la identidad del organizador y la autenticidad de la causa. Además, monitoreamos constantemente la actividad para garantizar la transparencia.",
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
    answer:
      "Sí, puedes donar el monto que desees. Cada aporte cuenta y hace la diferencia en las causas que apoyas.",
  },
  {
    id: "faq-5",
    question: "¿Cómo puedo crear una campaña en Minka?",
    answer:
      "Crear una campaña es fácil y gratuito. Solo necesitas registrarte, completar la información de tu causa y verificar tu identidad. Te guiaremos en cada paso del proceso.",
  },
];

export function HelpAccordion() {
  return (
    <Accordion type="single" collapsible className="mb-16">
      {faqItems.map((item) => (
        <AccordionItem
          key={item.id}
          value={item.id}
          className="border-b border-[#478C5C]/20"
        >
          <AccordionTrigger className="text-xl font-medium text-[#2c6e49] hover:text-[#2c6e49]/90 py-6">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-lg text-gray-600 py-4">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

