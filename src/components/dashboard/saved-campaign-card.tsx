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
  description?: string;
  donorCount?: number;
  amountRaised?: string;
  onUnsave?: (id: string) => Promise<void>;
}

export function SavedCampaignCard({
  id,
  title,
  imageUrl,
  location,
  isInclusive = false,
  description = "Ayuda a esta campaña y sé parte del cambio que queremos ver en el mundo.",
  donorCount = 0,
  amountRaised = "Bs. 0,00",
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
    <Link
      href={`/campaign/${id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-lg shadow-sm overflow-hidden relative hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex overflow-hidden relative">
        <div className="relative w-[140px] group-hover:w-[80px] transition-all duration-300">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover rounded-l-lg"
            sizes="140px"
          />
        </div>

        {/* Verified badge - moves to 50/50 position on hover */}
        <div className="absolute left-[140px] group-hover:left-[80px] top-1/2 transform -translate-y-1/2 -translate-x-1/2 z-10 transition-all duration-300">
          <div className="bg-[#2c6e49] group-hover:bg-[#2c6e49] rounded-full p-1 flex items-center justify-center w-[30px] h-[30px] group-hover:w-[36px] group-hover:h-[36px] transition-all duration-300 shadow-sm">
            <Image
              src="/icons/verified.svg"
              alt="Verified"
              width={20}
              height={20}
              className="brightness-0 invert" /* Always white */
            />
          </div>
        </div>

        {/* Unsave button */}
        {onUnsave && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white hover:text-red-500 z-20"
            onClick={handleUnsave}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Eliminar de guardados</span>
          </Button>
        )}

        <div className="flex-1 p-3 flex flex-col justify-between min-h-[90px]">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{title}</h3>

            {/* Tags */}
            <div className="flex gap-2 mt-1">
              {isInclusive && (
                <span className="text-xs font-medium py-1 px-2 rounded-full bg-[#e8f5ed] text-[#2c6e49]">
                  Inclusivo
                </span>
              )}
              <span className="text-xs font-medium py-1 px-2 rounded-full bg-[#e8f5ed] text-[#2c6e49]">
                {location}
              </span>
            </div>

            {/* Description - Only visible on hover */}
            <div className="overflow-hidden transition-all duration-300 mt-1">
              <p className="text-sm text-gray-600 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
                {description}
              </p>
            </div>

            {/* Stats - Only visible on hover */}
            <div className="overflow-hidden transition-all duration-300 mt-1">
              <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                <div className="space-y-2 text-[#2c6e49]">
                  <div>
                    <span className="font-medium text-base">Donadores: </span>
                    <span className="font-bold text-lg">{donorCount}</span>
                  </div>
                  <div>
                    <span className="font-medium text-base">Recaudado: </span>
                    <span className="font-bold text-lg">{amountRaised}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Separator - Only visible on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 self-center">
          <div className="w-px h-12 bg-gray-200"></div>
        </div>

        <div className="flex items-center pr-3 self-center">
          <div className="text-[#2c6e49] hover:bg-[#e8f5ed] border border-[#2c6e49] rounded-full px-5 py-2 text-sm flex items-center gap-2 font-medium transition-colors">
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
          </div>
        </div>
      </div>
    </Link>
  );
}
