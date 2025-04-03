import { redirect } from "next/navigation";

// Redirect from the static campaign page to a default campaign or the campaigns listing
export default function CampaignRedirect() {
  // You can change this to redirect to a default campaign if needed
  redirect("/campaigns");
}
