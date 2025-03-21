"use client";

import Link from "next/link";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  // Use fixed placeholder image
  const imageSrc = "/amboro-main.jpg";

  return (
    <div className="bg-white mb-0 flex">
      {/* Image with full height */}
      <div className="w-20 h-20 relative mr-4 flex-shrink-0">
        <img
          src={imageSrc}
          alt={title}
          className="object-cover w-full h-full rounded-md"
        />
      </div>

      {/* Content area */}
      <div className="flex-1 flex items-center">
        <div className="flex-1">
          <h3 className="text-base font-medium">
            <Link href={`/campaign/${id}`} className="hover:underline">
              {title}
            </Link>
          </h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}

          {/* Status indicator with a point instead of an icon */}
          <div className="mt-2">
            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
              • Finalizada
            </span>
          </div>
        </div>

        {/* Button to the right */}
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#2c6e49] hover:bg-[#f0f7f1] flex items-center"
            asChild
          >
            <Link href={`/campaign/${id}/dashboard`}>
              Administrar Campaña
              <Edit size={16} className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
