"use client";

import Link from "next/link";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CampaignStatus =
  | "active"
  | "pending_verification"
  | "in_revision"
  | "completed"
  | "draft";

interface CampaignCardProps {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  location: string;
  raisedAmount: number;
  goalAmount: number;
  progress: number;
  status: CampaignStatus;
}

export function CampaignCard({
  id,
  title,
  imageUrl,
  category,
  location,
  raisedAmount,
  goalAmount,
  progress,
  status,
}: CampaignCardProps) {
  const getStatusLabel = (status: CampaignStatus) => {
    switch (status) {
      case "active":
        return { label: "Activa", color: "text-green-600 bg-green-100" };
      case "pending_verification":
        return { label: "Sin Verificar", color: "text-blue-600 bg-blue-100" };
      case "in_revision":
        return { label: "En Revisión", color: "text-purple-600 bg-purple-100" };
      case "completed":
        return { label: "Finalizada", color: "text-red-600 bg-red-100" };
      default:
        return { label: "Borrador", color: "text-gray-600 bg-gray-100" };
    }
  };

  const statusInfo = getStatusLabel(status);

  // Use placeholder image if no image URL provided
  const imageSrc = "/amboro-main.jpg";

  return (
    <div className="rounded-lg overflow-hidden bg-white border border-gray-100 hover:shadow-md transition-all">
      <div className="relative">
        {/* Campaign Image */}
        <div className="h-40 relative">
          <img
            src={imageSrc}
            alt={title}
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      <div className="p-4">
        {/* Status and Verified Tags - Left side, below image */}
        <div className="flex items-center gap-2 mb-3">
          {status === "active" && (
            <img src="/verified-badge.svg" alt="Verified" className="w-5 h-5" />
          )}
          <span
            className={`text-xs font-medium py-1 px-2 rounded-full ${statusInfo.color} flex items-center gap-1`}
          >
            • {statusInfo.label}
          </span>
        </div>

        {/* Campaign Title */}
        <h3 className="text-lg font-medium text-[#2c6e49] mb-2">
          <Link href={`/campaign/${id}`} className="hover:underline">
            {title}
          </Link>
        </h3>

        {/* Category and Location */}
        <div className="flex text-sm text-gray-600 mb-4">
          <span className="mr-4">{category}</span>
          <span>{location}</span>
        </div>

        {/* Amount Raised */}
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-600">Recaudado</span>
          <span className="font-medium">
            Bs. {raisedAmount.toLocaleString()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2 rounded-full mb-1">
          <div
            className="bg-[#2c6e49] h-2 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Progress Percentage */}
        <div className="text-right text-sm text-gray-500 mb-4">{progress}%</div>

        {/* Admin Button - now borderless and at the start of the line */}
        <div className="flex justify-start">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#2c6e49] hover:bg-[#f0f7f1] flex items-center justify-center gap-2 px-0"
            asChild
          >
            <Link href={`/campaign/${id}/dashboard`}>
              <Edit size={16} />
              Administrar Campaña
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
