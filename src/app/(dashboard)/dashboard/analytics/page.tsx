import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ProfileData } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, HeartHandshake, Library, CheckCheck } from "lucide-react";

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(amount);
};

export default async function AnalyticsPage() {
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

  // --- Admin-Specific Data Fetching ---
  let adminData = {
    totalUsers: 0,
    totalCampaigns: 0,
    totalDonations: 0,
    pendingVerifications: 0,
  };

  if (profile?.role === "admin") {
    // Use Supabase Edge Function or RPC for aggregation if performance becomes an issue
    const [
      usersCountRes,
      campaignsCountRes,
      donationsSumRes,
      pendingVerificationsRes,
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("campaigns").select("id", { count: "exact", head: true }),
      supabase.from("donations").select("amount"), // Fetch all amounts - Aggregate client-side or use RPC
      supabase
        .from("campaigns")
        .select("id", { count: "exact", head: true })
        .eq("verification_status", false),
    ]);

    // Calculate total donations sum
    const totalDonationAmount =
      donationsSumRes.data?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

    adminData = {
      totalUsers: usersCountRes.count ?? 0,
      totalCampaigns: campaignsCountRes.count ?? 0,
      totalDonations: totalDonationAmount,
      pendingVerifications: pendingVerificationsRes.count ?? 0,
    };
  }
  // --- End Admin-Specific Data Fetching ---

  // TODO: Add logic for non-admin users if needed, or redirect them
  if (profile?.role !== "admin") {
    // Example: Redirect non-admins or show a limited view
    return (
      <div className="space-y-6 p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
        <p>Analytics view is only available for administrators.</p>
      </div>
    );
    // redirect("/dashboard");
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-3xl font-bold text-gray-800">Platform Analytics</h1>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminData.totalUsers}</div>
            {/* <p className="text-xs text-muted-foreground">+X% from last month</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Campaigns
            </CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminData.totalCampaigns}</div>
            {/* <p className="text-xs text-muted-foreground">+Y% from last month</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Donations
            </CardTitle>
            <HeartHandshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(adminData.totalDonations)}
            </div>
            {/* <p className="text-xs text-muted-foreground">+Z% from last month</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Verifications
            </CardTitle>
            <CheckCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminData.pendingVerifications}
            </div>
            {/* <p className="text-xs text-muted-foreground">W campaigns need review</p> */}
          </CardContent>
        </Card>
      </div>

      {/* TODO: Add more sections like Recent Activity, Charts etc. */}
      <div className="mt-6">
        {/* Placeholder for future charts/tables */}
        <Card>
          <CardHeader>
            <CardTitle>Donations Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Charts and detailed activity logs will be added here.
            </p>
            {/* Example: Could include a simple list of recent donations or a chart */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
