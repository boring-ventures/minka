import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function CampaignDetailLoading() {
  return (
    <div className="flex items-center justify-center py-16">
      <LoadingSpinner size="lg" />
    </div>
  );
}
