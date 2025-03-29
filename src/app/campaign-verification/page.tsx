import type { Metadata } from "next";
import { CampaignVerificationView } from "@/components/views/campaign-verification/CampaignVerificationView";

export const metadata: Metadata = {
  title: "Verificación de Campañas | Minka",
  description:
    "Verifica tu campaña en Minka para aumentar su credibilidad y atraer más apoyo para tu causa",
};

export default function CampaignVerificationPage() {
  return <CampaignVerificationView />;
}
