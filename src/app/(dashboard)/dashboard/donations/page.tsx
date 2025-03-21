import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function DonationsPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Get user's donations
  const { data: donations } = await supabase
    .from("donations")
    .select(
      `
      *,
      campaign:campaigns(id, title)
    `
    )
    .eq("donor_id", session.user.id)
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
        <h1 className="text-3xl font-bold text-gray-800">Mis donaciones</h1>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        {donations && donations.length > 0 ? (
          <div className="space-y-6">
            {donations.map((donation) => (
              <div
                key={donation.id}
                className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex justify-between">
                  <h3 className="font-medium text-lg">
                    <Link
                      href={`/campaign/${donation.campaign?.id}`}
                      className="text-[#2c6e49] hover:underline"
                    >
                      {donation.campaign?.title}
                    </Link>
                  </h3>
                  <span className="font-bold">${donation.amount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>
                    {new Date(donation.created_at).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span>
                    Estado:{" "}
                    {donation.payment_status === "completed"
                      ? "Completado"
                      : donation.payment_status === "pending"
                        ? "Pendiente"
                        : donation.payment_status === "failed"
                          ? "Fallido"
                          : "Reembolsado"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Aún no has realizado ninguna donación
            </p>
            <Link
              href="/campaigns"
              className="text-[#2c6e49] hover:underline font-medium"
            >
              Explorar campañas para donar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
