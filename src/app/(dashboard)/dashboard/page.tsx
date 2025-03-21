import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserDashboardContent } from "@/components/dashboard/user-dashboard-content";
import { AdminDashboardContent } from "@/components/dashboard/admin-dashboard-content";

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Get user profile and role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  // Check if user is admin
  const isAdmin = profile?.role === "admin";

  if (isAdmin) {
    return <AdminDashboardContent profile={profile} />;
  } else {
    return <UserDashboardContent profile={profile} />;
  }
}
