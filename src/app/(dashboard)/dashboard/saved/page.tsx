import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SavedCampaignsPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Get user's saved campaigns - this would need to be implemented with a saved_campaigns or bookmarks table
  // For now, we'll use placeholder data
  const placeholderSavedCampaigns = [
    {
      id: "1",
      title: "Esperanza en acción",
      description:
        "Apoyando a comunidades vulnerables con alimentos y cuidados básicos durante la crisis económica.",
      image_url: "https://source.unsplash.com/random/800x600/?charity",
      progress: 65,
      goal_amount: 5000,
      created_at: "2023-11-01T10:00:00Z",
    },
    {
      id: "2",
      title: "Unidos por la alegría",
      description:
        "Brindando espacios de recreación y esparcimiento para niños en zonas rurales del país.",
      image_url: "https://source.unsplash.com/random/800x600/?children",
      progress: 40,
      goal_amount: 3500,
      created_at: "2023-10-15T14:30:00Z",
    },
    {
      id: "3",
      title: "Cambiando vidas con sonrisas",
      description:
        "Ayudando a personas con discapacidad a través de programas de rehabilitación y apoyo psicosocial.",
      image_url: "https://source.unsplash.com/random/800x600/?disability",
      progress: 75,
      goal_amount: 7500,
      created_at: "2023-10-20T09:15:00Z",
    },
  ];

  // For testing empty state, uncomment the following line
  // const placeholderSavedCampaigns = [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Campañas guardadas</h1>

      {placeholderSavedCampaigns && placeholderSavedCampaigns.length > 0 ? (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {placeholderSavedCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-40 w-full">
                  <img
                    src={campaign.image_url}
                    alt={campaign.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg">
                    <Link
                      href={`/campaign/${campaign.id}`}
                      className="text-[#2c6e49] hover:underline"
                    >
                      {campaign.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mt-1 line-clamp-2">
                    {campaign.description}
                  </p>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">
                        Progreso: {campaign.progress}%
                      </span>
                      <span>Meta: Bs. {campaign.goal_amount}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#2c6e49] h-2 rounded-full"
                        style={{ width: `${campaign.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <Link href="/campaigns">Explorar campañas</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
