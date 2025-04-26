import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SavedCampaignCard } from "@/components/dashboard/saved-campaign-card";

export default async function SavedCampaignsPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // In a real implementation, you would fetch saved campaigns from a database table
  // For now, we'll use placeholder data to match the design in the image
  const savedCampaigns = [
    {
      id: "1",
      title: "Ayuda a Grecia a conseguir una silla de ruedas eléctrica",
      imageUrl: "/images/campaigns/wheelchair.jpg", // This should be replaced with an actual image
      category: "Salud",
      location: "Bolivia, Santa Cruz",
      isInclusive: true,
    },
    {
      id: "2",
      title: "Ayuda a Grecia a conseguir una silla de ruedas eléctrica",
      imageUrl: "/images/campaigns/wheelchair.jpg", // This should be replaced with an actual image
      category: "Salud",
      location: "Bolivia, Santa Cruz",
      isInclusive: true,
    },
    {
      id: "3",
      title: "Ayuda a Grecia a conseguir una silla de ruedas eléctrica",
      imageUrl: "/images/campaigns/wheelchair.jpg", // This should be replaced with an actual image
      category: "Salud",
      location: "Bolivia, Santa Cruz",
      isInclusive: true,
    },
  ];

  // For testing empty state, uncomment the following line
  // const savedCampaigns = [];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Campañas guardadas</h1>

      {savedCampaigns && savedCampaigns.length > 0 ? (
        <div className="space-y-6">
          {savedCampaigns.map((campaign, index) => (
            <div key={campaign.id} className="space-y-6">
              <SavedCampaignCard
                id={campaign.id}
                title={campaign.title}
                imageUrl={campaign.imageUrl}
                location={campaign.location}
                isInclusive={campaign.isInclusive}
              />
              {index < savedCampaigns.length - 1 && (
                <div className="h-px bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg py-12 px-4 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-6">
            <Info className="h-6 w-6 text-blue-500" />
          </div>

          <p className="text-gray-800 text-lg text-center mb-8">
            No tienes campañas guardadas todavía
          </p>

          <Button
            className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full px-8 py-3 text-base"
            asChild
          >
            <Link href="/campaign">Explorar campañas</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
