"use client";

import Link from "next/link";
import { Edit, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export type CampaignStatus =
  | "active"
  | "pending_verification"
  | "in_revision"
  | "completed"
  | "draft"
  | "cancelled";

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
  isVerified?: boolean;
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
  isVerified = false,
}: CampaignCardProps) {
  const router = useRouter();

  // Handle verify button click
  const handleVerifyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Store campaign ID in localStorage for verification page
    localStorage.setItem("verificationCampaignId", id);

    // Navigate to verification page
    router.push("/campaign-verification");
  };

  // Format status display text
  const getStatusDisplay = () => {
    switch (status) {
      case "active":
        return "Activa";
      case "completed":
        return "Completada";
      case "cancelled":
        return "Cancelada";
      case "draft":
        return "Borrador";
      default:
        return "Desconocido";
    }
  };

  // Use imageUrl from props and fallback to placeholder if not available
  const imageSrc = imageUrl || "/amboro-main.jpg";

  return (
    <div className="rounded-lg overflow-hidden bg-white border border-gray-100 hover:shadow-md transition-all h-[450px] grid grid-rows-[160px_1fr_50px]">
      {/* Image Section - Fixed height */}
      <div className="relative w-full h-full">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 384px"
        />
      </div>

      {/* Content Section - Scrollable if needed */}
      <div className="p-4 overflow-hidden">
        {/* Status indicator with verified check */}
        <div className="flex items-center gap-2 mb-3">
          {isVerified && status === "active" && (
            <Image
              src="/icons/verified.svg"
              alt="Verified"
              width={30}
              height={30}
            />
          )}
          <span
            className={`text-xs font-medium py-1 px-2 rounded-full ${status === "active" ? "text-green-600 bg-green-100" : status === "completed" ? "text-red-600 bg-red-100" : "text-gray-600 bg-gray-100"} flex items-center gap-1`}
          >
            <span className="text-lg inline-block leading-none">•</span>{" "}
            {getStatusDisplay()}
          </span>
        </div>

        {/* Campaign Title */}
        <h3 className="text-lg font-medium text-[#2c6e49] mb-2 line-clamp-2">
          <Link href={`/campaign/${id}`} className="hover:underline">
            {title}
          </Link>
        </h3>

        {/* Category and Location with truncation */}
        <div className="flex text-sm text-gray-600 mb-4 overflow-hidden">
          <span className="mr-4 truncate max-w-[50%]">{category}</span>
          <span className="truncate max-w-[50%]">{location}</span>
        </div>

        {/* Amount Raised */}
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-600">Recaudado</span>
          <span className="font-medium">
            Bs. {raisedAmount.toLocaleString()} de {goalAmount.toLocaleString()}
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
        <div className="text-right text-sm text-gray-500">{progress}%</div>
      </div>

      {/* Button Section - Fixed at bottom with fixed height */}
      <div className="p-4 pt-2 border-t border-gray-100">
        {/* Add verification action button if not verified and campaign is active */}
        {!isVerified && status === "active" ? (
          <div className="flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#2c6e49] hover:bg-[#f0f7f1] flex items-center justify-center gap-2 px-0 font-bold"
              onClick={handleVerifyClick}
            >
              Solicitar verificación
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#2c6e49] hover:bg-[#f0f7f1] flex items-center justify-center gap-2 px-0 font-bold"
              asChild
            >
              <Link href={`/dashboard/campaigns/${id}`}>
                Administrar Campaña
                <Edit className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-[#2c6e49] hover:bg-[#f0f7f1] flex items-center justify-center gap-2 px-0 font-bold"
            asChild
          >
            <Link href={`/dashboard/campaigns/${id}`}>
              Administrar Campaña
              <Edit className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      {/* Add a verification badge if verified */}
      {isVerified && (
        <div className="absolute top-2 right-2 bg-[#4caf50] text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
          <CheckCircle size={12} />
          <span>Verificada</span>
        </div>
      )}
    </div>
  );
}
