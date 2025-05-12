"use client";

import Link from "next/link";
import { Edit } from "lucide-react";
import Image from "next/image";

interface CompletedCampaignCardProps {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
}

export function CompletedCampaignCard({
  id,
  title,
  imageUrl,
  description,
}: CompletedCampaignCardProps) {
  return (
    <Link
      href={`/campaign/${id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-lg shadow-sm overflow-hidden min-h-[120px] relative hover:shadow-md transition-all duration-200"
    >
      <div className="flex overflow-hidden min-h-[120px] relative">
        <div className="relative w-[120px]">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover rounded-l-lg"
            sizes="120px"
          />
        </div>

        {/* Floating verified badge - repositioned to overlap image and content exactly 50/50 */}
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

        <div className="flex-1 p-5 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}

            {/* Status indicator with a bigger point */}
            <div className="mt-2">
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
                <span className="text-lg inline-block leading-none">•</span>{" "}
                Finalizada
              </span>
            </div>
          </div>
          <div
            className="text-[#2c6e49] flex items-center hover:underline font-bold"
            onClick={(e) => e.stopPropagation()}
          >
            Administrar Campaña <Edit className="ml-2 h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
