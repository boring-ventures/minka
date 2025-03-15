"use client";

import { Button } from "@/components/ui/button";
import { Check, Clock, Share2, Bookmark } from "lucide-react";
import Link from "next/link";

interface CampaignProgressProps {
  isVerified: boolean;
  createdAt: string;
  currentAmount: number;
  targetAmount: number;
  donorsCount: number;
  campaignTitle?: string;
  campaignOrganizer?: string;
  campaignLocation?: string;
}

export function CampaignProgress({
  isVerified,
  createdAt,
  currentAmount,
  targetAmount,
  donorsCount,
  campaignTitle = "",
  campaignOrganizer = "",
  campaignLocation = "",
}: CampaignProgressProps) {
  const progress = (currentAmount / targetAmount) * 100;

  return (
    <div
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      id="campaign-progress"
    >
      <h2 className="text-xl font-semibold text-[#2c6e49] mb-1">
        Avances de la campaña
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Cada aporte cuenta. ¡Sé parte del cambio!
      </p>

      <div className="flex items-center gap-6 mb-4">
        {isVerified && (
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#2c6e49]" />
            <span className="text-sm">Campaña verificada</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm">Creada hace {createdAt}</span>
        </div>
      </div>

      {/* First separator */}
      <hr className="h-px w-full bg-gray-200 my-4" />

      <div className="space-y-4 mb-4">
        <div className="flex justify-between text-sm">
          <span>Recaudado Bs. {currentAmount.toLocaleString()}</span>
          <span>{donorsCount} donadores</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2c6e49] rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span>Objetivo de recaudación</span>
          <span>Bs. {targetAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Second separator */}
      <hr className="h-px w-full bg-gray-200 my-4" />

      <div className="space-y-3">
        <Link
          href={{
            pathname: "/donate",
            query: {
              campaignId: "1", // This would be the actual campaign ID
              title: campaignTitle,
              organizer: campaignOrganizer,
              location: campaignLocation,
            },
          }}
        >
          <Button className="w-full bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full py-6">
            Donar ahora
          </Button>
        </Link>
        <Button
          variant="outline"
          className="w-full border-gray-200 hover:bg-gray-50 rounded-full py-6"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Compartir
        </Button>
        <Button
          variant="ghost"
          className="w-full hover:bg-gray-50 rounded-full py-6"
        >
          <Bookmark className="mr-2 h-4 w-4" />
          Guardar campaña
        </Button>
      </div>
    </div>
  );
}
