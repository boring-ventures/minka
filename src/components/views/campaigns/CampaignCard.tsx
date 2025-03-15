"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface CampaignCardProps {
  id?: number;
  title: string;
  image: string;
  category: string;
  location: string;
  progress: number;
  verified?: boolean;
  description?: string;
  donorCount?: number;
  amountRaised?: string;
  href?: string;
}

export function CampaignCard({
  title,
  image,
  category,
  location,
  progress,
  verified = true,
  description = "Ayuda a esta campaña y sé parte del cambio que queremos ver en el mundo.",
  donorCount = 0,
  amountRaised = "Bs. 0,00",
  href = "/campaigns",
}: CampaignCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden group relative transition-all duration-300 h-full">
      {/* Campaign Image - Always visible but partially covered */}
      <div className="relative h-56">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      {/* Default Card Content */}
      <div className="p-6 bg-white transition-all duration-300 group-hover:bg-white/80 group-hover:backdrop-blur-sm h-[calc(100%-224px)]">
        <div className="flex flex-col mb-3">
          <div className="mb-2 flex-shrink-0 h-8">
            {verified ? (
              <Image
                src="/landing-page/step-2.png"
                alt="Verified"
                width={32}
                height={32}
                className="text-[#2c6e49]"
              />
            ) : (
              <div className="w-8 h-8" />
            )}
          </div>
          <h3 className="font-medium text-2xl text-[#2c6e49] line-clamp-2">
            {title}
          </h3>
        </div>
        <div className="flex items-center text-base text-gray-600 mb-4 flex-wrap gap-2">
          <span className="bg-[#F8FAF2] text-[#2c6e49] px-2 py-1 rounded-md">
            {category}
          </span>
          <span className="bg-[#F8FAF2] text-[#2c6e49] px-2 py-1 rounded-md">
            {location}
          </span>
        </div>
        <div className="mb-4">
          <div className="w-full bg-[#EBEDE6] rounded-full h-3">
            <div
              className="bg-[#2c6e49] h-3 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-end mt-2">
            <span className="text-base text-gray-600">{progress}%</span>
          </div>
        </div>
        <Link href={href} className="block">
          <Button className="w-full bg-white text-[#2c6e49] hover:bg-[#2c6e49] hover:text-white text-lg shadow-none border-0 rounded-full justify-start">
            Donar ahora <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>

      {/* Hover State Content */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm p-6 flex flex-col opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 rounded-xl">
        <div className="flex flex-col mb-3">
          <div className="mb-2 flex-shrink-0 h-12">
            {verified ? (
              <div className="w-12 h-12 rounded-full bg-[#2c6e49] flex items-center justify-center">
                <Image
                  src="/landing-page/step-2.png"
                  alt="Verified"
                  width={32}
                  height={32}
                  className="brightness-0 invert"
                />
              </div>
            ) : (
              <div className="w-12 h-12" />
            )}
          </div>
          <h3 className="font-medium text-2xl text-[#2c6e49] line-clamp-2">
            {title}
          </h3>
        </div>

        <div className="flex items-center text-base text-gray-600 mb-3 flex-wrap gap-2">
          <span className="border border-[#d1e7dd] bg-[#f8f9fa] text-[#2c6e49] px-2 py-1 rounded-md">
            {category}
          </span>
          <span className="border border-[#d1e7dd] bg-[#f8f9fa] text-[#2c6e49] px-2 py-1 rounded-md">
            {location}
          </span>
        </div>

        <p className="text-gray-600 mb-4 flex-grow line-clamp-4">
          {description}
        </p>

        <div className="flex justify-between text-gray-600 mb-3">
          <div>
            <p className="font-medium">Donadores</p>
            <p className="text-xl font-bold">{donorCount}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">Recaudado</p>
            <p className="text-xl font-bold">{amountRaised}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="w-full bg-[#d1e7dd] rounded-full h-3">
            <div
              className="bg-[#2c6e49] h-3 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-end mt-2">
            <span className="text-base text-gray-600">{progress}%</span>
          </div>
        </div>

        <Link href={href} className="block">
          <Button className="w-full bg-[#2c6e49] text-white hover:bg-[#1e4d33] text-lg shadow-none border-0 rounded-full justify-start">
            Donar ahora <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
