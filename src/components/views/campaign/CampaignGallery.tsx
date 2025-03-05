"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface CampaignGalleryProps {
  images: { url: string; type: "image" | "video" }[];
}

export function CampaignGallery({ images }: CampaignGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-gray-200">
        <Image
          src={images[selectedImage].url || "/placeholder.svg"}
          alt="Campaign image"
          fill
          className="object-cover"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {images.map((image, index) => (
          <button
            type="button"
            key={image.url}
            onClick={() => setSelectedImage(index)}
            className={`relative aspect-[16/9] overflow-hidden rounded-xl border-2 ${
              selectedImage === index
                ? "border-[#2c6e49]"
                : "border-transparent"
            }`}
          >
            <Image
              src={image.url || "/placeholder.svg"}
              alt={`Campaign image ${index + 1}`}
              fill
              className="object-cover"
            />
            {image.type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="h-8 w-8 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
