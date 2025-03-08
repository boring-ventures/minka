import type { Metadata } from "next";
import { Quicksand, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/context/theme-context";
import { Footer } from "@/components/views/landing-page/Footer";
import { Header } from "@/components/views/landing-page/Header";

const APP_NAME = "MINKA - Impulsa sueños, transforma vidas";
const APP_DESCRIPTION =
  "Plataforma de donaciones para causas sociales en Bolivia";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  generator: "v0.dev",
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: APP_URL,
    siteName: APP_NAME,
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
    other: {
      rel: "apple-touch-icon",
      url: "/apple-icon.png",
    },
  },
  manifest: "/manifest.json",
  keywords: [
    "donaciones",
    "causas sociales",
    "bolivia",
    "crowdfunding",
    "ayuda social",
  ],
};

export default function RootLayout({
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
          flex 
          min-h-screen 
          flex-col 
          bg-[#f5f7e9]
          font-quicksand
        `}
      >
        <ThemeProvider defaultTheme="system" storageKey="app-theme">
          <AuthProvider>
            <QueryProvider>
              <Header />
              <div className="flex-grow">{children}</div>
              <Footer />
              <Toaster />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
