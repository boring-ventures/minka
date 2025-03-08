"use client";
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const menuItems = [
    { href: "/campaigns", label: "Donar" },
    { href: "/create-campaign", label: "Crear campaña" },
    { href: "/about-us", label: "Nosotros" },
    { href: "/help", label: "Ayuda" },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex container mx-auto py-6 px-4 justify-between items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-2S5vgSiFRwu8gClKBuwTXkOi5H46aN.svg"
            alt="MINKA Logo"
            width={120}
            height={40}
            className="h-12 w-auto"
          />
        </Link>
        <nav className="flex items-center space-x-8">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[#2c6e49] hover:text-[#1e4d33] font-medium text-lg"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button
              variant="ghost"
              className="text-[#2c6e49] hover:text-[#1e4d33] text-lg"
            >
              Ingresar
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button
              variant="outline"
              className="rounded-full border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49] hover:text-white text-lg px-6 py-2"
            >
              Registrarse
            </Button>
          </Link>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex justify-between items-center bg-[#2c6e49] px-4 py-3 sticky top-0 z-50">
        <button
          type="button"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          className="text-white p-1"
        >
          <Menu size={24} />
        </button>
        <Link href="/" className="flex items-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-2S5vgSiFRwu8gClKBuwTXkOi5H46aN.svg"
            alt="MINKA Logo"
            width={100}
            height={32}
            className="h-8 w-auto"
          />
        </Link>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col">
          {/* Mobile Menu Header */}
          <div className="flex justify-between items-center px-4 py-3 border-b">
            <button
              type="button"
              onClick={toggleMenu}
              aria-label="Close menu"
              className="text-gray-700 p-1"
            >
              <X size={24} />
            </button>
            <div className="flex justify-center flex-1">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-2S5vgSiFRwu8gClKBuwTXkOi5H46aN.svg"
                alt="MINKA Logo"
                width={100}
                height={32}
                className="h-8 w-auto"
              />
            </div>
            <div className="w-8" /> {/* Empty div for spacing */}
          </div>

          {/* Mobile Menu Items */}
          <nav className="flex-1 flex flex-col">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-4 text-[#2c6e49] font-medium text-lg border-b"
                onClick={toggleMenu}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Footer */}
          <div className="p-4 flex justify-center">
            <Link href="/sign-in" className="w-full">
              <Button
                className="w-full bg-white border border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49] hover:text-white rounded-full"
                onClick={toggleMenu}
              >
                Ingresar / Registrarse
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

