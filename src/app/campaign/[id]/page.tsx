import { Suspense } from "react";
import { notFound } from "next/navigation";
import Loading from "./loading";
import CampaignClientPage from "@/components/views/campaign/CampaignClientPage";

// Server component that passes the campaign ID to the client component
export default function CampaignPage({ params }: { params: { id: string } }) {
  const id = params.id;
  console.log(`Server: Rendering campaign page with ID: ${id}`);

  if (!id) {
    console.error("Server: Campaign ID is required but not provided");
    return notFound();
  }

  // Use Suspense to show loading state while client component fetches data
  return (
    <Suspense fallback={<Loading />}>
      <CampaignClientPage id={id} />
    </Suspense>
  );
}
