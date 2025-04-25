import { redirect } from "next/navigation";

export default async function CampaignVerificationRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Redirect to the main campaign verification page
  // The CampaignVerificationView component already handles the campaignId prop
  redirect(`/campaign-verification?id=${(await params).id}`);
}
