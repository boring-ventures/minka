"use client";

import Link from "next/link";
import Image from "next/image";
import { Bookmark, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SavedCampaignCardProps {
  id: string;
  title: string;
  imageUrl: string;
  category?: string;
  location: string;
  isInclusive?: boolean;
  onUnsave?: (id: string) => Promise<void>;
}

export function SavedCampaignCard({
  id,
  title,
  imageUrl,
  location,
  isInclusive = false,
  onUnsave,
}: SavedCampaignCardProps) {
  const handleUnsave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onUnsave) {
      await onUnsave(id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm flex overflow-hidden min-h-[120px] relative">
      <div className="relative w-[120px]">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover rounded-l-lg"
          sizes="120px"
        />
      </div>

      {/* Verified badge */}
      <div className="absolute left-[120px] top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-10">
        <div className="bg-[#2c6e49] rounded-full p-1 flex items-center justify-center w-[30px] h-[30px]">
          <Image
            src="/icons/verified.svg"
            alt="Verified"
            width={20}
            height={20}
            className="brightness-0 invert" /* Make icon white */
          />
        </div>
      </div>

      {/* Unsave button */}
      {onUnsave && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white hover:text-red-500"
          onClick={handleUnsave}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Eliminar de guardados</span>
        </Button>
      )}

      <div className="flex-1 p-5 flex flex-col justify-center">
        <h3 className="font-semibold text-gray-900">{title}</h3>

        {/* Tags */}
        <div className="flex gap-2 mt-2">
          {isInclusive && (
            <span className="text-xs font-medium py-1 px-2 rounded-full bg-[#e8f5ed] text-[#2c6e49]">
              Inclusivo
            </span>
          )}
          <span className="text-xs font-medium py-1 px-2 rounded-full bg-[#e8f5ed] text-[#2c6e49]">
            {location}
          </span>
        </div>
      </div>

      <div className="flex items-center pr-5">
        <Link
          href={`/campaign/${id}`}
          className="text-[#2c6e49] hover:bg-[#e8f5ed] border border-[#2c6e49] rounded-full px-5 py-2 text-sm flex items-center gap-2 font-medium transition-colors"
        >
          Donar ahora
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 12H19M19 12L13 6M19 12L13 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
