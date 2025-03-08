"use client";

import { MessageCircle, Mail, Phone } from "lucide-react";

export function ContactSection() {
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-[#2c6e49] mb-8">
        Atención al cliente
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="https://www.facebook.com/minka.mx"
          className="flex items-center gap-3 p-4 rounded-lg border-2 border-[#478C5C]/20 hover:border-[#2c6e49] transition-colors bg-white"
        >
          <MessageCircle
            className="h-5 w-5 text-[#2c6e49]"
            aria-hidden="true"
          />
          <span className="text-gray-600">Contáctanos por Messenger</span>
        </a>

        <a
          href="mailto:contacto@minka.mx"
          className="flex items-center gap-3 p-4 rounded-lg border-2 border-[#478C5C]/20 hover:border-[#2c6e49] transition-colors bg-white"
        >
          <Mail className="h-5 w-5 text-[#2c6e49]" aria-hidden="true" />
          <span className="text-gray-600">
            Escríbenos por correo electrónico
          </span>
        </a>

        <a
          href="https://wa.me/5215555555555"
          className="flex items-center gap-3 p-4 rounded-lg border-2 border-[#478C5C]/20 hover:border-[#2c6e49] transition-colors bg-white"
        >
          <Phone className="h-5 w-5 text-[#2c6e49]" aria-hidden="true" />
          <span className="text-gray-600">Contáctanos por WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
