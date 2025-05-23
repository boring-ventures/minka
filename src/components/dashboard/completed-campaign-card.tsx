"use client";

import Link from "next/link";
import { Edit } from "lucide-react";
import Image from "next/image";

interface CompletedCampaignCardProps {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
  donorCount?: number;
  amountRaised?: string;
  totalGoal?: string;
}

export function CompletedCampaignCard({
  id,
  title,
  imageUrl,
  description,
  donorCount = 0,
  amountRaised = "Bs. 0,00",
  totalGoal = "Bs. 0,00",
}: CompletedCampaignCardProps) {
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

        <div className="flex-1 p-3 flex items-center justify-between min-h-[90px]">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                {description}
              </p>
            )}

            {/* Status indicator with a bigger point */}
            <div className="mt-1">
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
                <span className="text-lg inline-block leading-none">•</span>{" "}
                Finalizada
              </span>
            </div>

            {/* Expanded description - Only visible on hover */}
            <div className="overflow-hidden transition-all duration-300 mt-1">
              <p className="text-sm text-gray-600 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
                {description && description.length > 50
                  ? description
                  : "Esta campaña ha sido completada exitosamente gracias a la colaboración de todos los donadores."}
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

          {/* Separator - Only visible on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 self-center">
            <div className="w-px h-12 bg-gray-200"></div>
          </div>

          <div
            className="text-[#2c6e49] flex items-center hover:underline font-bold px-3 py-2 rounded-full transition-all duration-300 self-center"
            onClick={(e) => e.stopPropagation()}
          >
            Administrar Campaña <Edit className="ml-2 h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
