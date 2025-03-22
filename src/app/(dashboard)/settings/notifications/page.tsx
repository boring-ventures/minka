"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export default function SettingsNotificationsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to the dashboard notifications page
    router.push("/dashboard/notifications");
  }, [router]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Notificaciones</h1>

      <div className="bg-white rounded-lg p-8 shadow-sm">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Info className="h-6 w-6 text-blue-500" />
          </div>

          <h2 className="text-xl font-semibold">
            Configuración de notificaciones
          </h2>
          <p className="text-gray-600 max-w-md">
            La configuración de notificaciones se ha trasladado a la página
            principal de notificaciones.
          </p>

          <Button
            onClick={() => router.push("/dashboard/notifications")}
            className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full px-6 mt-4"
          >
            Ir a notificaciones
          </Button>
        </div>
      </div>
    </div>
  );
}
