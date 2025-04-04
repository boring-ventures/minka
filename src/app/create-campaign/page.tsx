"use client";

import { CreateCampaignHeader } from "@/components/views/create-campaign/CreateCampaignHeader";
import { CampaignForm } from "@/components/views/create-campaign/CampaignForm";
import { Header } from "@/components/views/landing-page/Header";
import { Footer } from "@/components/views/landing-page/Footer";
import Image from "next/image";
import { CampaignFormProvider } from "@/components/providers/campaign-form-provider";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function CreateCampaignPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user, redirect to sign-in
    if (!isLoading && !user) {
      router.push("/sign-in?returnUrl=/create-campaign");
    }
  }, [user, isLoading, router]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If no user and not loading, don't render the content
  // The useEffect will handle the redirect
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-[#f5f7e9]">
      <Header />

      {/* Spacer div to account for the fixed header height */}
      <div className="h-28 md:h-28"></div>

      {/* Page header with increased height */}
      <div className="w-full h-[500px] relative border-t border-[#2c6e49]/10">
        <Image
          src="/page-header.svg"
          alt="Page Header"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-[90px] font-bold text-white">Crea tu campaña</h1>
        </div>
      </div>

      <main className="overflow-x-hidden">
        <CreateCampaignHeader />
        <div className="container mx-auto px-4 py-16">
          <CampaignFormProvider>
            <CampaignForm />
          </CampaignFormProvider>
        </div>
      </main>
      <Footer />
    </div>
  );
}
