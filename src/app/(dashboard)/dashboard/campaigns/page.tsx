import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ManageCampaignsPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Get user's campaigns
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("*")
    .eq("organizer_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-[#2c6e49] hover:text-[#1e4d33] flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            <span>Volver al perfil</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Mis campañas</h1>
        </div>
        <Link href="/create-campaign">
          <Button className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white flex items-center gap-2">
            <Plus size={16} />
            Nueva campaña
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        {campaigns && campaigns.length > 0 ? (
          <div className="space-y-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">
                      <Link
                        href={`/campaign/${campaign.id}`}
                        className="text-[#2c6e49] hover:underline"
                      >
                        {campaign.title}
                      </Link>
                    </h3>
                    <p className="text-gray-500 mt-1">
                      {campaign.description.substring(0, 100)}...
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      campaign.campaign_status === "active"
                        ? "bg-green-100 text-green-800"
                        : campaign.campaign_status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : campaign.campaign_status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {campaign.campaign_status === "active"
                      ? "Activa"
                      : campaign.campaign_status === "completed"
                        ? "Completada"
                        : campaign.campaign_status === "cancelled"
                          ? "Cancelada"
                          : "Borrador"}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-4">
                  <span>
                    Creada:{" "}
                    {new Date(campaign.created_at).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <Link
                    href={`/dashboard/campaigns/${campaign.id}`}
                    className="text-[#2c6e49] hover:underline"
                  >
                    Administrar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Aún no has creado ninguna campaña
            </p>
            <Link
              href="/create-campaign"
              className="text-[#2c6e49] hover:underline font-medium"
            >
              Crear tu primera campaña
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
