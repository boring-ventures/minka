import { Clock } from "lucide-react";
import Image from "next/image";

export interface CampaignUpdateType {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  youtubeUrl?: string;
  imageUrl?: string;
}

interface CampaignUpdatesProps {
  updates: CampaignUpdateType[];
}

export function CampaignUpdates({ updates }: CampaignUpdatesProps) {
  if (!updates || updates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl md:text-4xl font-semibold text-[#2c6e49]">
        Actualizaciones de la campaña
      </h2>
      <div className="space-y-6">
        {updates.map((update) => (
          <div
            key={update.id}
            className="bg-white rounded-lg p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-[#2c6e49]" />
              <span className="text-gray-600">
                {typeof update.createdAt === "string"
                  ? new Date(update.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Fecha no disponible"}
              </span>
            </div>

            <h3 className="text-xl font-semibold mb-2">{update.title}</h3>
            <p className="text-gray-700 mb-4">{update.message}</p>

            {update.imageUrl && (
              <div className="mt-4 mb-4 rounded-lg overflow-hidden">
                <div className="relative h-60 w-full">
                  <img
                    src={update.imageUrl}
                    alt={update.title}
                    className="object-cover w-full h-full rounded-lg"
                  />
                </div>
              </div>
            )}

            {update.youtubeUrl && (
              <div className="mt-4">
                <a
                  href={update.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[#2c6e49] hover:underline"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2"
                  >
                    <path
                      d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 9L15 12L10 15V9Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Ver video
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
