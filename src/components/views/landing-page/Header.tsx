import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="container mx-auto py-6 px-4 flex justify-between items-center">
      <Link href="/" className="flex items-center">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-2S5vgSiFRwu8gClKBuwTXkOi5H46aN.svg"
          alt="MINKA Logo"
          width={120}
          height={40}
          className="h-12 w-auto"
        />
      </Link>
      <nav className="hidden md:flex items-center space-x-8">
        <Link
          href="/donar"
          className="text-[#2c6e49] hover:text-[#1e4d33] font-medium text-lg"
        >
          Donar
        </Link>
        <Link
          href="/crear-campana"
          className="text-[#2c6e49] hover:text-[#1e4d33] font-medium text-lg"
        >
          Crear campaña
        </Link>
        <Link
          href="/nosotros"
          className="text-[#2c6e49] hover:text-[#1e4d33] font-medium text-lg"
        >
          Nosotros
        </Link>
        <Link
          href="/ayuda"
          className="text-[#2c6e49] hover:text-[#1e4d33] font-medium text-lg"
        >
          Ayuda
        </Link>
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
  );
}

