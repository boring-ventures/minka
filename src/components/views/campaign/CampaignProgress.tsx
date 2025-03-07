import { Button } from "@/components/ui/button";
import { Check, Clock, Share2, Bookmark } from "lucide-react";
import Link from "next/link";

interface CampaignProgressProps {
  isVerified: boolean;
  createdAt: string;
  currentAmount: number;
  targetAmount: number;
  donorsCount: number;
}

export function CampaignProgress({
  isVerified,
  createdAt,
  currentAmount,
  targetAmount,
  donorsCount,
}: CampaignProgressProps) {
  const progress = (currentAmount / targetAmount) * 100;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[#2c6e49] mb-1">
        Avances de la campaña
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Cada aporte cuenta. ¡Sé parte del cambio!
      </p>

      <div className="flex items-center gap-6 mb-6">
        {isVerified && (
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-[#2c6e49]" />
            <span className="text-sm">Campaña verificada</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm">Creada hace {createdAt}</span>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-sm">
          <span>Recaudado Bs. {currentAmount.toLocaleString()}</span>
          <span>{donorsCount} donadores</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2c6e49] rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span>Objetivo de recaudación</span>
          <span>Bs. {targetAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-3">
        <Button className="w-full bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full py-6">
          <Link href="/campaigns">Donar ahora</Link>
        </Button>
        <Button
          variant="outline"
          className="w-full border-gray-200 hover:bg-gray-50 rounded-full py-6"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Compartir
        </Button>
        <Button
          variant="outline"
          className="w-full border-gray-200 hover:bg-gray-50 rounded-full py-6"
        >
          <Bookmark className="mr-2 h-4 w-4" />
          Guardar campaña
        </Button>
      </div>
    </div>
  );
}
