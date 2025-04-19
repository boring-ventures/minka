import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminDonationTable } from "@/components/dashboard/admin-donation-table";
import { ProfileData } from "@/types"; // For admin check
// Import relevant Prisma types
import { PaymentStatus } from "@prisma/client";

// Define the structure using Prisma types where applicable
// Note: Supabase fetch returns structure based on select query, not exact Prisma model
export interface AdminDonationData {
  id: string;
  amount: number; // Prisma uses Decimal, Supabase client likely returns number
  status: PaymentStatus | string; // Use Prisma enum, allow string for safety
  created_at: string; // Prisma uses DateTime, Supabase client returns string
  campaigns:
    | {
        // Supabase returns this as an array even for one-to-one joins via select
        title: string | null;
      }[]
    | null;
  profiles:
    | {
        // Supabase returns this as an array
        name: string | null;
        email: string | null;
      }[]
    | null;
}

export default async function ManageDonationsPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Fetch current user's profile to check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single<Pick<ProfileData, "role">>();

  // Only allow admins to access this page
  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch all donations with related campaign and profile data
  const { data: donations, error } = await supabase
    .from("donations")
    .select(
      `
      id,
      amount,
      status,
      created_at,
      campaigns ( title ),
      profiles ( name, email )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching donations:", error);
    return (
      <div className="p-6 text-red-600">
        Error loading donations. Please try again later.
      </div>
    );
  }

  // Type assertion after fetching - Cast Supabase result to our interface
  const validDonations: AdminDonationData[] = (donations ||
    []) as AdminDonationData[];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-3xl font-bold text-gray-800">Manage Donations</h1>
      <div className="bg-card rounded-lg p-4 md:p-6 border">
        <AdminDonationTable donations={validDonations} />
      </div>
    </div>
  );
}
