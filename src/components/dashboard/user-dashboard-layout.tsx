"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowLeft, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Footer } from "@/components/views/landing-page/Footer";

interface UserDashboardLayoutProps {
  children: React.ReactNode;
}

export function UserDashboardLayout({ children }: UserDashboardLayoutProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    }
    getUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleBack = () => {
    // Try to go back in history first
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback to the homepage if there's no history
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-[#f5f7e9] flex flex-col">
      {/* Header - without background */}
      <header className="py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Left: Back button */}
          <Button
            variant="ghost"
            className="text-[#2c6e49] hover:text-[#1e4d33] font-medium flex items-center text-base"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>

          {/* Center: Minka logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/brand/logo.svg"
              alt="MINKA"
              width={140}
              height={40}
              className="h-10 w-auto"
            />
          </Link>

          {/* Right: User profile */}
          <div className="flex items-center">
            <User className="h-5 w-5 text-[#2c6e49] mr-2" />
            <span className="text-[#2c6e49] font-medium text-base">
              {profile?.name || "Usuario"}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-[80%] mx-auto">{children}</div>
      </main>

      {/* Added extra space before footer */}
      <div className="py-16"></div>

      <Footer />
    </div>
  );
}
