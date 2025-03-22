"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Camera, FileText, Bell, Bookmark, LogOut, Edit } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ProfileData } from "@/types";

interface UserDashboardContentProps {
  profile: ProfileData | null;
  onEditProfile?: () => void;
}

export function UserDashboardContent({
  profile,
  onEditProfile,
}: UserDashboardContentProps) {
  const [removeProfilePicture, setRemoveProfilePicture] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return format(date, "dd/MM/yyyy", { locale: es });
  };

  const birthDate = formatDate(profile?.birth_date);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-800">
          Información personal
        </h1>
        <Button
          variant="ghost"
          className="text-[#2c6e49] hover:text-[#1e4d33] flex items-center gap-2"
          onClick={onEditProfile}
        >
          Editar <Edit size={16} />
        </Button>
      </div>

      {/* Personal Information Card */}
      <div className="bg-white rounded-lg p-8 shadow-sm">
        {/* Profile Picture Section */}
        <div className="flex items-start gap-8 pb-8 border-b border-gray-200">
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 bg-[#2c6e49] rounded-full flex items-center justify-center overflow-hidden">
              {profile?.profile_picture ? (
                <Image
                  src={profile.profile_picture}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-white">
                  <div className="rounded-full bg-[#2c6e49] p-2"></div>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-gray-600 mb-2">
              Imagen de perfil (Recomendado: 800×800 px)
            </p>
            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                id="remove-picture"
                checked={removeProfilePicture}
                onCheckedChange={(checked) =>
                  setRemoveProfilePicture(checked as boolean)
                }
              />
              <label htmlFor="remove-picture" className="text-sm text-gray-600">
                Eliminar imagen de perfil
              </label>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-[#2c6e49] border-[#2c6e49] hover:bg-[#2c6e49] hover:text-white"
            >
              Seleccionar imagen <Camera size={16} />
            </Button>
          </div>
        </div>

        {/* Personal Information - 3 columns, 2 rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <div>
            <h3 className="text-gray-500 mb-2">Nombre completo</h3>
            <p className="text-gray-800 font-medium">
              {profile?.name || "No disponible"}
            </p>
          </div>
          <div>
            <h3 className="text-gray-500 mb-2">Fecha de nacimiento</h3>
            <p className="text-gray-800 font-medium">
              {birthDate || "No disponible"}
            </p>
          </div>
          <div>
            <h3 className="text-gray-500 mb-2">Cédula de Identidad</h3>
            <p className="text-gray-800 font-medium">
              {profile?.identity_number || "No disponible"}
            </p>
          </div>
          <div>
            <h3 className="text-gray-500 mb-2">Correo electrónico</h3>
            <p className="text-gray-800 font-medium">
              {profile?.email || "No disponible"}
            </p>
          </div>
          <div>
            <h3 className="text-gray-500 mb-2">Teléfono</h3>
            <p className="text-gray-800 font-medium">
              {profile?.phone || "No disponible"}
            </p>
          </div>
          <div>
            <h3 className="text-gray-500 mb-2">Dirección</h3>
            <p className="text-gray-800 font-medium">
              {profile?.address || "No disponible"}
            </p>
          </div>
        </div>
      </div>

      {/* Control Section Header - Matched size with Information personal */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-800">¡Toma el control!</h1>
      </div>

      {/* Control Cards Section - Single card with 2 cards per row */}
      <div className="bg-white rounded-lg p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* My Donations Card */}
          <Link href="/dashboard/donations" className="block">
            <div className="h-full border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col">
              <div className="mb-6 text-[#2c6e49]">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-medium text-gray-800">
                Mis donaciones
              </h3>
            </div>
          </Link>

          {/* Manage Campaigns Card */}
          <Link href="/dashboard/campaigns" className="block">
            <div className="h-full border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col">
              <div className="mb-6 text-[#2c6e49]">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-medium text-gray-800">
                Administrar campañas
              </h3>
            </div>
          </Link>

          {/* Notifications Card */}
          <Link href="/dashboard/notifications" className="block">
            <div className="h-full border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col">
              <div className="mb-6 text-[#2c6e49]">
                <Bell size={24} />
              </div>
              <h3 className="text-xl font-medium text-gray-800">
                Notificaciones
              </h3>
            </div>
          </Link>

          {/* Saved Campaigns Card */}
          <Link href="/dashboard/saved" className="block">
            <div className="h-full border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col">
              <div className="mb-6 text-[#2c6e49]">
                <Bookmark size={24} />
              </div>
              <h3 className="text-xl font-medium text-gray-800">
                Campañas guardadas
              </h3>
            </div>
          </Link>
        </div>
      </div>

      {/* Sign Out Button - More rounded with icon on the right */}
      <div className="flex justify-start">
        <Button
          className="flex items-center gap-2 bg-[#2c6e49] hover:bg-[#1e4d33] text-white px-6 py-2 rounded-full"
          onClick={handleSignOut}
        >
          Cerrar sesión <LogOut size={16} />
        </Button>
      </div>
    </div>
  );
}
