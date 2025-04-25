import { redirect } from "next/navigation";

export default function CampaignVerificationRedirect({
  params,
}: {
  params: { id: string };
}) {
  // Redirect to the main campaign verification page
  // The CampaignVerificationView component already handles the campaignId prop
  redirect(`/campaign-verification?id=${params.id}`);
}
