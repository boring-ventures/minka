"use client";

import React from "react";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  [key: string]: any;
}

interface AdminDashboardContentProps {
  profile: ProfileData;
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
          <a
            href="/dashboard/campaigns"
            className="text-primary hover:underline font-medium"
          >
            Manage Campaigns →
          </a>
        </div>

        <div className="bg-card rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Users</h3>
          <p className="text-muted-foreground mb-6">
            Manage user accounts and permissions
          </p>
          <a
            href="/dashboard/users"
            className="text-primary hover:underline font-medium"
          >
            Manage Users →
          </a>
        </div>

        <div className="bg-card rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-2">Analytics</h3>
          <p className="text-muted-foreground mb-6">
            View donation statistics and platform metrics
          </p>
          <a
            href="/dashboard/analytics"
            className="text-primary hover:underline font-medium"
          >
            View Analytics →
          </a>
        </div>
      </div>
    </div>
  );
}
