"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, HeartHandshake, Library, CheckCheck } from "lucide-react";
import { ProfileData } from "@/types";
import { useDb } from "@/hooks/use-db";
import { useAuth } from "@/providers/auth-provider";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(amount);
};

export default function AnalyticsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { getProfile, getAnalytics, loading } = useDb();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [adminData, setAdminData] = useState({
    totalUsers: 0,
    totalCampaigns: 0,
    totalDonations: 0,
    pendingVerifications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) {
        router.push("/sign-in");
        return;
      }

      // Fetch current user's profile to check role
      const prismaProfile = await getProfile(user.id);

      if (!prismaProfile) {
        router.push("/sign-in");
        return;
      }

      // Convert to ProfileData
      const getISOString = (dateVal: any): string => {
        if (typeof dateVal === "string") return dateVal;
        if (dateVal instanceof Date) return dateVal.toISOString();
        return new Date().toISOString();
      };

      const profileData: ProfileData = {
        id: prismaProfile.id,
        name: prismaProfile.name,
        email: prismaProfile.email,
        phone: prismaProfile.phone,
        address: prismaProfile.address || "",
        role: prismaProfile.role,
        created_at: getISOString(prismaProfile.createdAt),
      };

      setProfile(profileData);

      // --- Admin-Specific Data Fetching ---
      if (prismaProfile.role === "admin") {
        const analyticsData = await getAnalytics();
        setAdminData(analyticsData);
      }

      setIsLoading(false);
    }

    loadData();
  }, [user, router, getProfile, getAnalytics]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect non-admins or show a limited view
  if (profile?.role !== "admin") {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
        <p>Analytics view is only available for administrators.</p>
      </div>
    );
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
