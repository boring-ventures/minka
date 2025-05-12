"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  MessageSquare as WhatsAppIcon,
} from "lucide-react";

export function Footer() {
  return (
    <div className="container mx-auto px-4 mt-auto">
      <footer className="bg-[#2c6e49] rounded-t-3xl text-white">
        <div className="p-8 md:p-16">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16">
            <div className="mb-8 md:mb-0">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-2S5vgSiFRwu8gClKBuwTXkOi5H46aN.svg"
                alt="MINKA Logo"
                width={180}
                height={70}
                className="h-16 w-auto brightness-0 invert"
              />
            </div>

            <nav className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
              <Link
                href="/help"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-200 transition-colors underline underline-offset-4 text-lg font-bold"
              >
                Centro de ayuda
              </Link>
              <Link
                href="/campaign"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-200 transition-colors underline underline-offset-4 text-lg font-bold"
              >
                Donar
              </Link>
              <Link
                href="/about-us"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-200 transition-colors underline underline-offset-4 text-lg font-bold"
              >
                Nosotros
              </Link>
            </nav>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <p className="text-white font-bold text-2xl md:text-3xl mb-8 md:mb-0 max-w-xl">
              Tu apoyo tiene poder. <br />
              Conecta con Minka.
            </p>

            <div className="flex gap-6">
              <Link
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-full p-3 text-[#2c6e49] hover:bg-[#e8f5ed] transition-colors duration-300"
                aria-label="Síguenos en Facebook"
              >
                <Facebook className="h-7 w-7" />
              </Link>
              <Link
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-full p-3 text-[#2c6e49] hover:bg-[#e8f5ed] transition-colors duration-300"
                aria-label="Síguenos en Instagram"
              >
                <Instagram className="h-7 w-7" />
              </Link>
              <Link
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-full p-3 text-[#2c6e49] hover:bg-[#e8f5ed] transition-colors duration-300"
                aria-label="Contáctanos por WhatsApp"
              >
                <WhatsAppIcon className="h-7 w-7" />
              </Link>
              <Link
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-full p-3 text-[#2c6e49] hover:bg-[#e8f5ed] transition-colors duration-300"
                aria-label="Síguenos en LinkedIn"
              >
                <Linkedin className="h-7 w-7" />
              </Link>
            </div>
          </div>

          <div className="h-px bg-[#4a8c67] mb-10" />

          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white/80">
            <p>© 2024 Minka. Todos los derechos reservados.</p>
            <Link
              href="/politicas-de-privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors underline underline-offset-4 mt-4 md:mt-0"
            >
              Políticas de privacidad
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
