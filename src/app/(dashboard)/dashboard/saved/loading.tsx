import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function SavedCampaignsLoading() {
  return (
    <div className="flex items-center justify-center py-16">
      <LoadingSpinner size="lg" />
    </div>
  );
}
