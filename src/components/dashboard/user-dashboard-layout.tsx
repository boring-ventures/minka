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
import { ProfileData } from "@/types";

interface UserDashboardLayoutProps {
  children: React.ReactNode;
}

export function UserDashboardLayout({ children }: UserDashboardLayoutProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const supabase = createClientComponentClient();
  const [isCampaignPage, setIsCampaignPage] = useState(false);

  useEffect(() => {
    async function getUserProfile() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/sign-in");
          return;
        }

        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setProfile(data);
      } catch (error) {
        console.error("Error getting user profile", error);
      }
    }

    getUserProfile();
  }, [router, supabase]);

  // Check if the page is a campaign detail page
  useEffect(() => {
    // This checks if we're on a specific campaign page (/dashboard/campaigns/[id])
    const path = window.location.pathname;
    const isCampaignDetailPage = /\/dashboard\/campaigns\/[^\/]+$/.test(path);
    setIsCampaignPage(isCampaignDetailPage);
  }, []);

  const handleBack = () => {
    router.back();
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

      <main
        className={
          isCampaignPage
            ? "flex-grow w-full"
            : "flex-grow container mx-auto px-4 py-8"
        }
      >
        <div className={isCampaignPage ? "w-full" : "max-w-[80%] mx-auto"}>
          {children}
        </div>
      </main>

      {/* Added extra space before footer */}
      {!isCampaignPage && <div className="py-16"></div>}

      {/* Only show footer on non-campaign pages */}
      {!isCampaignPage && <Footer />}
    </div>
  );
}
