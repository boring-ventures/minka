"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserDashboardContent } from "@/components/dashboard/user-dashboard-content";
import { AdminDashboardContent } from "@/components/dashboard/admin-dashboard-content";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { X } from "lucide-react";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
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
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function getUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/sign-in");
        return;
      }

      // Get user profile and role
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(data);
      setIsAdmin(data?.role === "admin");

      // Initialize form data with profile data
      if (data) {
        setProfileForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
        });
      }

      setIsLoading(false);
    }

    getUser();
  }, [supabase, router]);

  const handleSaveChanges = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: profileForm.name,
          email: profileForm.email,
          phone: profileForm.phone,
          address: profileForm.address,
        })
        .eq("id", profile?.id);

      if (error) throw error;

      // Update local profile state
      setProfile({
        ...profile,
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        address: profileForm.address,
      });

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
    return <div>Loading...</div>;
  }

  return (
    <>
      {isAdmin ? (
        <AdminDashboardContent profile={profile} />
      ) : (
        <UserDashboardContent
          profile={profile}
          onEditProfile={() => setIsEditModalOpen(true)}
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
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
                placeholder="Ingresa tu nombre"
                className="w-full border border-black bg-transparent"
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
