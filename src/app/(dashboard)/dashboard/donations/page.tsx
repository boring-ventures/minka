import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DonationsHistoryTable } from "@/components/dashboard/donations-history-table";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

// @ts-expect-error - Temporarily disable type checking for this component due to Next.js PageProps conflict
export default async function DonationsPage({ searchParams }) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;
  const pageSize = 6;
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  // Get user's donations with pagination
  const { data: donations, count } = await supabase
    .from("donations")
    .select(
      `
      *,
      campaign:campaigns(id, title)
    `,
      { count: "exact" }
    )
    .eq("donor_id", session.user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  // Sample data for visualization - will be removed in production
  const sampleDonations = [
    {
      id: "1",
      amount: 123.0,
      created_at: "2024-01-04T10:00:00Z",
      campaign: { id: "101", title: "Esperanza en acción" },
    },
    {
      id: "2",
      amount: 789.0,
      created_at: "2024-01-04T09:30:00Z",
      campaign: { id: "102", title: "Unidos por la alegría" },
    },
    {
      id: "3",
      amount: 234.0,
      created_at: "2024-01-04T09:00:00Z",
      campaign: { id: "103", title: "Cambiando vidas con sonrisas" },
    },
    {
      id: "4",
      amount: 567.0,
      created_at: "2024-01-04T08:30:00Z",
      campaign: { id: "104", title: "Semillas que inspiran" },
    },
    {
      id: "5",
      amount: 890.0,
      created_at: "2024-01-04T08:00:00Z",
      campaign: { id: "105", title: "Apoyo para nuevos comienzos" },
    },
    {
      id: "6",
      amount: 345.0,
      created_at: "2024-01-04T07:30:00Z",
      campaign: { id: "106", title: "Esperanza y solidaridad" },
    },
  ];

  // Use sample data for development, real data for production
  const displayDonations =
    process.env.NODE_ENV === "development" ? sampleDonations : donations;
  const totalPages = count ? Math.ceil(count / pageSize) : 4; // Default to 4 pages in development

  // For testing empty state, uncomment the following line
  // const displayDonations = [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Historial de donaciones
      </h1>

      {displayDonations && displayDonations.length > 0 ? (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <DonationsHistoryTable
            donations={displayDonations}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg py-12 px-4 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-6">
            <Info className="h-6 w-6 text-blue-500" />
          </div>

          <p className="text-gray-800 text-lg text-center mb-8">
            Aún no has realizado ninguna donación. ¡Es un buen momento para
            empezar!
          </p>

          <Button
            className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full px-8 py-3 text-base"
            asChild
          >
            <Link href="/campaigns">Donar ahora</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
