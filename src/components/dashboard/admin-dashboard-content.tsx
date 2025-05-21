"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ProfileData } from "@/types";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  CheckCircle,
  Bell,
  BarChart,
  Users,
  LibraryBig,
  ArrowRight,
} from "lucide-react";

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
      <div className="rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Panel Administrativo</h2>
        <p>
          Bienvenido al panel administrativo, {profile?.name || "Administrador"}
          . Desde aquí puedes gestionar todas las campañas, usuarios y
          configuraciones de la plataforma.
        </p>
      </div>

      <h3 className="text-xl font-semibold mb-4">Gestión de Plataforma</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <BarChart className="h-6 w-6 mr-2 text-[#2c6e49]" />
            <h3 className="text-xl font-semibold">Estadísticas</h3>
          </div>
          <p className="text-gray-600 mb-6 h-24">
            Visualiza métricas detalladas sobre campañas, donaciones, usuarios y
            desempeño general de la plataforma.
          </p>
          <Link
            href="/dashboard/analytics"
            className="text-[#2c6e49] hover:underline font-medium flex items-center"
          >
            Ver estadísticas <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 mr-2 text-[#2c6e49]" />
            <h3 className="text-xl font-semibold">Verificación</h3>
          </div>
          <p className="text-gray-600 mb-6 h-24">
            Revisa y aprueba solicitudes de verificación de campañas. Valida la
            documentación y autenticidad de los organizadores.
          </p>
          <Link
            href="/dashboard/verification"
            className="text-[#2c6e49] hover:underline font-medium flex items-center"
          >
            Gestionar verificaciones <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Bell className="h-6 w-6 mr-2 text-[#2c6e49]" />
            <h3 className="text-xl font-semibold">Notificaciones</h3>
          </div>
          <p className="text-gray-600 mb-6 h-24">
            Envía notificaciones sobre actualizaciones de la plataforma a los
            usuarios que han dado su consentimiento.
          </p>
          <Link
            href="/dashboard/notifications/admin"
            className="text-[#2c6e49] hover:underline font-medium flex items-center"
          >
            Gestionar notificaciones <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4 mt-8">Gestión de Contenido</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <LibraryBig className="h-6 w-6 mr-2 text-[#2c6e49]" />
            <h3 className="text-xl font-semibold">Campañas</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Administra todas las campañas activas, revisa contenido y realiza
            modificaciones cuando sea necesario.
          </p>
          <Link
            href="/dashboard/campaigns"
            className="text-[#2c6e49] hover:underline font-medium flex items-center"
          >
            Gestionar campañas <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 mr-2 text-[#2c6e49]" />
            <h3 className="text-xl font-semibold">Usuarios</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Visualiza y administra las cuentas de usuarios, permisos y roles
            dentro de la plataforma.
          </p>
          <Link
            href="/dashboard/users"
            className="text-[#2c6e49] hover:underline font-medium flex items-center"
          >
            Gestionar usuarios <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut size={16} />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
