"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const [profileName, setProfileName] = useState<string>("");
  const supabase = createClientComponentClient();

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Fetch user profile data from Supabase
  useEffect(() => {
    async function fetchUserProfile() {
      if (!user) return;

      try {
        const { data } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .single();

        if (data?.name) {
          setProfileName(data.name);
        }
      } catch (error) {
        console.error("Error fetching user profile", error);
      }
    }

    fetchUserProfile();
  }, [user, supabase]);

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

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/");
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
      <header
        className={`hidden md:flex fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#2c6e49] shadow-md h-20"
            : "bg-gradient-to-r from-white to-[#f5f7e9] h-28"
        }`}
      >
        <div className="container mx-auto h-full px-4 flex items-center">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center mr-12"
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-2S5vgSiFRwu8gClKBuwTXkOi5H46aN.svg"
              alt="MINKA Logo"
              width={120}
              height={40}
              className={`h-12 w-auto transition-all duration-300 ${isScrolled ? "brightness-0 invert" : ""}`}
            />
          </Link>
          <nav className="flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium text-lg transition-colors ${
                  isScrolled
                    ? "text-white hover:text-gray-200"
                    : "text-[#2c6e49] hover:text-[#1e4d33]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4 ml-auto">
            {user ? (
              <Link href="/dashboard" className="flex items-center gap-2">
                <User
                  className={`h-5 w-5 ${isScrolled ? "text-white" : "text-[#2c6e49]"}`}
                />
                <span
                  className={`font-medium ${isScrolled ? "text-white" : "text-[#2c6e49]"}`}
                >
                  {profileName || "Usuario"}
                </span>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button
                    variant="ghost"
                    className={`text-lg ${
                      isScrolled
                        ? "text-white hover:text-gray-200"
                        : "text-[#2c6e49] hover:text-[#1e4d33]"
                    }`}
                  >
                    Ingresar
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    variant="outline"
                    className={`rounded-full text-lg px-6 py-2 ${
                      isScrolled
                        ? "border-white text-white hover:bg-white hover:text-[#2c6e49]"
                        : "border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49] hover:text-white"
                    }`}
                  >
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden flex justify-between items-center bg-gradient-to-r from-white to-[#f5f7e9] px-4 py-3 sticky top-0 z-50">
        <button
          type="button"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          className="text-[#2c6e49] p-1"
        >
          <Menu size={24} />
        </button>
        <Link href="/" onClick={handleLogoClick} className="flex items-center">
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
            {user ? (
              <Link href="/dashboard" className="w-full">
                <Button
                  className="w-full flex items-center justify-center gap-2 bg-white border border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49] hover:text-white rounded-full"
                  onClick={toggleMenu}
                >
                  <User className="h-5 w-5" />
                  <span>{profileName || "Usuario"}</span>
                </Button>
              </Link>
            ) : (
              <Link href="/sign-in" className="w-full">
                <Button
                  className="w-full bg-white border border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49] hover:text-white rounded-full"
                  onClick={toggleMenu}
                >
                  Ingresar / Registrarse
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
