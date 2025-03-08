"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

interface CampaignCardProps {
  title: string;
  image: string;
  category: string;
  location: string;
  progress: number;
  verified?: boolean;
}

export function CampaignCard({
  title,
  image,
  category,
  location,
  progress,
  verified,
}: CampaignCardProps) {
  return (
    <Link href="/campaign" className="block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-100">
        <div className="relative h-48">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover"
          />
          {verified && (
            <div className="absolute top-4 left-4 bg-white rounded-full p-1">
              <Check className="h-4 w-4 text-[#2c6e49]" />
            </div>
          )}
        </div>
        <div className="p-6">
          <h3 className="font-medium text-xl text-[#2c6e49] mb-3">{title}</h3>
          <div className="flex items-center text-sm mb-4 gap-2">
            <span className="bg-[#e8f0e9] text-[#2c6e49] px-3 py-1 rounded-full">
              {category}
            </span>
            <span className="bg-[#e8f0e9] text-[#2c6e49] px-3 py-1 rounded-full">
              {location}
            </span>
          </div>
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#2c6e49] h-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-end mt-2">
              <span className="text-sm text-gray-600">{progress}%</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49] hover:text-white rounded-full"
          >
            Donar ahora <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}
