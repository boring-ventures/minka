"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserDashboardContent } from "@/components/dashboard/user-dashboard-content";
import { AdminDashboardContent } from "@/components/dashboard/admin-dashboard-content";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import { ProfileData } from "@/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth, Profile } from "@/providers/auth-provider";
import { useDb } from "@/hooks/use-db";

// Ensure ProfileData and Profile have compatible shapes for our purposes
type DashboardProfile = ProfileData;

export default function DashboardPage() {
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const router = useRouter();
  // Get auth context including the existing profile if available
  const { user, profile: authProfile } = useAuth();
  const { getProfile, updateProfile } = useDb();

  // Helper to convert any profile object to our consistent DashboardProfile format
  const formatProfileData = useCallback(
    (data: Profile | ProfileData | any): DashboardProfile => {
      // Function to safely get ISO string
      const getISOString = (dateVal: any): string => {
        if (typeof dateVal === "string") return dateVal;
        if (dateVal instanceof Date) return dateVal.toISOString();
        return new Date().toISOString();
      };

      return {
        id: data.id,
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        role: data.role || "user",
        created_at: data.created_at || getISOString(data.createdAt),
        profile_picture: data.profile_picture || data.profilePicture || null,
        // Include any other fields that might be expected
        ...(data as object),
      };
    },
    []
  );

  // Load profile data from auth context if available or fetch it if needed
  const loadProfileData = useCallback(async () => {
    if (!user) {
      router.push("/sign-in");
      return null;
    }

    // If we already have a profile in auth context, use it instead of fetching again
    if (authProfile && Object.keys(authProfile).length > 0) {
      console.log("Using profile from auth context:", authProfile);
      return authProfile;
    }

    console.log("Fetching profile from API for user:", user.id);
    // Otherwise fetch the profile
    return await getProfile(user.id);
  }, [user, authProfile, router, getProfile]);

  // Function to refresh profile data
  const refreshProfileData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Always fetch fresh data from the API
      const freshProfileData = await getProfile(user.id);

      if (freshProfileData) {
        const formattedProfile = formatProfileData(freshProfileData);
        setProfile(formattedProfile);
        setIsAdmin(formattedProfile.role === "admin");

        // Update form data with fresh profile data
        setProfileForm({
          name: formattedProfile.name || "",
          email: formattedProfile.email || "",
          phone: formattedProfile.phone || "",
          address: formattedProfile.address || "",
        });
      }
    } catch (error) {
      console.error("Error refreshing profile data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, getProfile, formatProfileData]);

  useEffect(() => {
    let isMounted = true;

    async function initializeDashboard() {
      try {
        setIsLoading(true);

        // Try to use existing profile data first
        const profileData = await loadProfileData();

        if (!isMounted || !profileData) return;

        // Format the profile data consistently
        const formattedProfile = formatProfileData(profileData);

        setProfile(formattedProfile);
        setIsAdmin(formattedProfile.role === "admin");

        // Initialize form data with profile data
        setProfileForm({
          name: formattedProfile.name || "",
          email: formattedProfile.email || "",
          phone: formattedProfile.phone || "",
          address: formattedProfile.address || "",
        });
      } catch (error) {
        console.error("Error loading dashboard:", error);
        if (isMounted) {
          toast({
            title: "Error",
            description: "No se pudo cargar el dashboard. Intenta nuevamente.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeDashboard();

    return () => {
      isMounted = false;
    };
  }, [user, loadProfileData, formatProfileData]);

  const handleSaveChanges = async () => {
    try {
      if (!profile) return;

      const { error } = await updateProfile(profile.id, {
        name: profileForm.name,
        phone: profileForm.phone,
        address: profileForm.address,
      });

      if (error) throw error;

      // Refresh profile data after update
      await refreshProfileData();

      setIsEditModalOpen(false);

      toast({
        title: "Perfil actualizado",
        description: "Tus datos han sido actualizados correctamente",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar tu perfil. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {isAdmin ? (
        <AdminDashboardContent profile={profile} />
      ) : (
        <UserDashboardContent
          profile={profile}
          onEditProfile={() => setIsEditModalOpen(true)}
          onProfileUpdated={refreshProfileData}
        />
      )}

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-[#F9F9F3] p-0 border-0 max-w-lg mx-auto [&>button]:hidden">
          {/* Header with beige background */}
          <div className="flex justify-between items-center p-6 border-b bg-[#f0ead6]">
            <DialogTitle className="text-[#2c6e49] text-xl font-semibold">
              Editar Información personal
            </DialogTitle>
            {/* Perfect sized X icon */}
            <div className="w-12 h-12 flex items-center justify-center">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#2c6e49] bg-transparent border-none cursor-pointer p-0"
              >
                <X className="h-6 w-6" strokeWidth={2} />
                <span className="sr-only">Close</span>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium"
              >
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                readOnly
                disabled
                className="w-full border border-black bg-transparent opacity-70 cursor-not-allowed"
              />
            </div>

            {/* Phone Field - with consistent styling */}
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-gray-700 font-medium"
              >
                Teléfono
              </label>
              <div className="flex w-full border border-black rounded-md overflow-hidden">
                <div className="flex items-center px-3 py-2 bg-transparent border-r border-black">
                  <span className="mr-2">🇧🇴</span>
                  <span>+591</span>
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                  placeholder="33445567"
                  className="flex-1 h-11 px-3 py-2 bg-transparent border-0 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* Address Field */}
            <div className="space-y-2">
              <label
                htmlFor="address"
                className="block text-gray-700 font-medium"
              >
                Dirección
              </label>
              <Input
                id="address"
                value={profileForm.address}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, address: e.target.value })
                }
                placeholder="Ingresa tu dirección"
                className="w-full border border-black bg-transparent"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSaveChanges}
              className="w-full mt-6 bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full py-4"
            >
              Guardar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
