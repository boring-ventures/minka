"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  PhoneIcon as WhatsApp,
} from "lucide-react";

export function Footer() {
  return (
    <div className="container mx-auto px-4">
      <footer className="bg-[#2c6e49] rounded-t-3xl text-white">
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="mb-8 md:mb-0">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-2S5vgSiFRwu8gClKBuwTXkOi5H46aN.svg"
                alt="MINKA Logo"
                width={160}
                height={60}
                className="h-12 w-auto brightness-0 invert"
              />
            </div>

            <nav className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
              <Link
                href="/help"
                className="text-white hover:text-gray-200 transition-colors"
              >
                Centro de ayuda
              </Link>
              <Link
                href="/campaigns"
                className="text-white hover:text-gray-200 transition-colors"
              >
                Donar
              </Link>
              <Link
                href="/recursos"
                className="text-white hover:text-gray-200 transition-colors"
              >
                Más recursos
              </Link>
              <Link
                href="/about-us"
                className="text-white hover:text-gray-200 transition-colors"
              >
                Nosotros
              </Link>
            </nav>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <p className="text-white/90 text-lg mb-6 md:mb-0">
              Tu apoyo tiene poder. Conecta con Minka.
            </p>

            <div className="flex gap-4">
              <Link
                href="#"
                className="bg-white rounded-full p-2.5 text-[#2c6e49] hover:bg-gray-100 transition-colors"
                aria-label="Síguenos en Facebook"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="bg-white rounded-full p-2.5 text-[#2c6e49] hover:bg-gray-100 transition-colors"
                aria-label="Síguenos en Instagram"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="bg-white rounded-full p-2.5 text-[#2c6e49] hover:bg-gray-100 transition-colors"
                aria-label="Contáctanos por WhatsApp"
              >
                <WhatsApp className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="bg-white rounded-full p-2.5 text-[#2c6e49] hover:bg-gray-100 transition-colors"
                aria-label="Síguenos en LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="h-px bg-[#4a8c67] mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white/80">
            <p>© 2024 Minka. Todos los derechos reservados.</p>
            <Link
              href="/politicas-de-privacidad"
              className="hover:text-white transition-colors underline underline-offset-4"
            >
              Políticas de privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
