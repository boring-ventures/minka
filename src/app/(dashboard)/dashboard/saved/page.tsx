import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Heart } from "lucide-react";

export default async function SavedCampaignsPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Get user's saved campaigns
  const { data: savedCampaigns } = await supabase
    .from("saved_campaigns")
    .select(
      `
      *,
      campaign:campaigns(
        id, 
        title, 
        description, 
        goal_amount, 
        collected_amount, 
        percentage_funded,
        days_remaining,
        media:campaign_media(media_url, is_primary)
      )
    `
    )
    .eq("profile_id", session.user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-[#2c6e49] hover:text-[#1e4d33] flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          <span>Volver al perfil</span>
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Campañas guardadas</h1>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        {savedCampaigns && savedCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedCampaigns.map((saved) => {
              const campaign = saved.campaign;
              const primaryMedia = campaign.media.find((m) => m.is_primary);
              const mediaUrl = primaryMedia
                ? primaryMedia.media_url
                : "/campaign-placeholder.jpg";

              return (
                <div
                  key={saved.id}
                  className="border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-40">
                    <Image
                      src={mediaUrl}
                      alt={campaign.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-2 line-clamp-1">
                      <Link
                        href={`/campaign/${campaign.id}`}
                        className="text-[#2c6e49] hover:underline"
                      >
                        {campaign.title}
                      </Link>
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {campaign.description}
                    </p>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div
                        className="bg-[#2c6e49] h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(campaign.percentage_funded * 100, 100)}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        ${campaign.collected_amount} recaudado
                      </span>
                      <span className="text-gray-500">
                        {Math.round(campaign.percentage_funded * 100)}%
                      </span>
                    </div>

                    <div className="mt-4 text-sm text-gray-500 flex justify-between">
                      <span>Meta: ${campaign.goal_amount}</span>
                      <span>{campaign.days_remaining} días restantes</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 flex flex-col items-center">
            <Heart size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">No tienes campañas guardadas</p>
            <Link
              href="/campaigns"
              className="text-[#2c6e49] hover:underline font-medium"
            >
              Explorar campañas
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
