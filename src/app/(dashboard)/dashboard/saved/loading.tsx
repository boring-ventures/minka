import { Skeleton } from "@/components/ui/skeleton";

export default function SavedCampaignsLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-48" />
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm flex overflow-hidden min-h-[120px] relative">
              <Skeleton className="w-[120px] h-[120px]" />
              <div className="flex-1 p-5 flex flex-col justify-center space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
              <div className="flex items-center pr-5">
                <Skeleton className="h-10 w-32 rounded-full" />
              </div>
            </div>
            <div className="h-px bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
