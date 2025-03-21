import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function DonationsLoading() {
  return (
    <div className="flex items-center justify-center py-16">
      <LoadingSpinner size="lg" />
    </div>
  );
}
