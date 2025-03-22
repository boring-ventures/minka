"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { MessageSquare } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-[#f5f7e9] font-quicksand">
      {/* Background SVG covering the screen width */}
      <div className="fixed bottom-0 left-0 right-0 z-0">
        <Image
          src="/auth/auth-bg.svg"
          alt="Background with plants"
          width={1440}
          height={535}
          priority
          className="h-auto w-full"
        />
      </div>

      {/* Content container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="flex w-full max-w-6xl items-center justify-between px-4">
          {/* Logo on the left - much larger and with link */}
          <div className="hidden lg:block">
            <Link href="/">
              <Image
                src="/brand/logo.svg"
                alt="Minka Logo"
                width={420}
                height={134}
                priority
                className="transition-transform hover:scale-105"
              />
            </Link>
          </div>

          {/* Error content */}
          <div className="w-full max-w-md lg:w-2/5">
            {/* Mobile logo (only visible on small screens) */}
            <div className="mb-6 flex justify-center lg:hidden">
              <Link href="/">
                <Image
                  src="/brand/logo.svg"
                  alt="Minka Logo"
                  width={140}
                  height={45}
                  priority
                />
              </Link>
            </div>
            <div className=" p-8 rounded-xl">
              <div className="flex flex-col items-center text-center space-y-8">
                <h1 className="text-5xl font-bold text-[#2c6e49]">¡Ups!</h1>
                <h2 className="text-3xl font-semibold text-gray-800">
                  Algo salió mal
                </h2>
                <p className="text-xl text-black">
                  ¡Lo sentimos! Por favor, intenta de nuevo más tarde o
                  contáctanos si el problema persiste. Estamos aquí para
                  ayudarte.
                </p>
                <div className="flex flex-col space-y-4 w-full pt-4">
                  <Button
                    asChild
                    className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full px-6 py-6 text-lg w-full"
                  >
                    <Link href="/" className="flex items-center justify-center">
                      Ir al inicio
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-[#2c6e49] text-[#2c6e49] hover:bg-[#e8f5ed] rounded-full px-6 py-6 text-lg w-full"
                  >
                    <Link
                      href="https://wa.me/5215555555555"
                      className="flex items-center justify-center"
                    >
                      Contáctanos por WhatsApp
                      <MessageSquare className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
