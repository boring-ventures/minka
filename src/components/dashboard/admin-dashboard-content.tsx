"use client";

import React from "react";
import Link from "next/link";
import { ProfileData } from "@/types";

interface AdminDashboardContentProps {
  profile: ProfileData | null;
}

export function AdminDashboardContent({ profile }: AdminDashboardContentProps) {
  return (
    <div className="space-y-8">
      <div className="bg-card rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Welcome to the admin dashboard, {profile?.name || "Admin"}. You have
          access to manage all campaigns and users.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Campaigns</h3>
          <p className="text-muted-foreground mb-6">
            Review and manage all active campaigns
          </p>
          <Link
            href="/dashboard/campaigns"
            className="text-primary hover:underline font-medium"
          >
            Manage Campaigns →
          </Link>
        </div>

        <div className="bg-card rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Users</h3>
          <p className="text-muted-foreground mb-6">
            Manage user accounts and permissions
          </p>
          <Link
            href="/dashboard/users"
            className="text-primary hover:underline font-medium"
          >
            Manage Users →
          </Link>
        </div>

        <div className="bg-card rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Analytics</h3>
          <p className="text-muted-foreground mb-6">
            View donation statistics and platform metrics
          </p>
          <Link
            href="/dashboard/analytics"
            className="text-primary hover:underline font-medium"
          >
            View Analytics →
          </Link>
        </div>
      </div>
    </div>
  );
}
