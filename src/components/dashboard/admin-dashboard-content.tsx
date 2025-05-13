"use client";

import React from "react";
import Link from "next/link";
import { ProfileData } from "@/types";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface AdminDashboardContentProps {
  profile: ProfileData | null;
}

export function AdminDashboardContent({ profile }: AdminDashboardContentProps) {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();

      // Use history API to clean up URL state
      window.history.pushState({}, "", "/");

      // Force redirect to homepage
      router.replace("/");

      // Show toast notification
      toast({
        title: "Éxito",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

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

      <div className="flex justify-end mt-4">
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="flex items-center gap-2 text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
        >
          <LogOut size={16} />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
