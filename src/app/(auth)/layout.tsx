import Image from "next/image";
import Link from "next/link";
import { Quicksand, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/context/theme-context";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className="scroll-smooth">
      <body
        className={`
          ${quicksand.variable} 
          ${geistMono.variable} 
          antialiased
          font-quicksand
          min-h-screen
          bg-[#f5f7e9]
        `}
      >
        <ThemeProvider defaultTheme="system" storageKey="app-theme">
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

              {/* Auth content (sign-in or sign-up) */}
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
                {children}
              </div>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
