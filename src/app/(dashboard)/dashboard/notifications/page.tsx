"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/providers/auth-provider";
import { useDb, NotificationPreferences } from "@/hooks/use-db";

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    newsUpdates: false,
    campaignUpdates: true,
  });

  const router = useRouter();
  const { user } = useAuth();
  const { getNotificationPreferences, updateNotificationPreferences } = useDb();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        if (!user) {
          router.push("/sign-in");
          return;
        }

        // Get user's notification preferences
        const prefsData = await getNotificationPreferences(user.id);

        if (prefsData) {
          setPreferences({
            newsUpdates: prefsData.newsUpdates,
            campaignUpdates: prefsData.campaignUpdates,
          });
        }

        // Placeholder notifications for demo
        const placeholderNotifications = [
          {
            id: "1",
            title: "¡Gracias por tu donación!",
            message:
              "Tu donación de Bs. 200 a la campaña 'Esperanza en acción' ha sido recibida. ¡Gracias por tu generosidad!",
            created_at: "2023-11-15T14:30:00Z",
            read: true,
          },
          {
            id: "2",
            title: "Actualización de campaña",
            message:
              "La campaña 'Unidos por la alegría' a la que donaste ha alcanzado el 75% de su meta. ¡Gracias por ser parte de este logro!",
            created_at: "2023-11-10T09:15:00Z",
            read: false,
          },
          {
            id: "3",
            title: "Confirmación de cuenta",
            message:
              "Tu cuenta ha sido verificada exitosamente. Ahora puedes aprovechar todas las funciones de Minka.",
            created_at: "2023-11-05T16:45:00Z",
            read: true,
          },
        ];

        // Use placeholder data in development
        setNotifications(
          process.env.NODE_ENV === "development" ? placeholderNotifications : [] // In production, we would fetch from the database
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, router, getNotificationPreferences]);

  const handleToggle = async (key: "newsUpdates" | "campaignUpdates") => {
    try {
      // Update local state immediately for responsive UI
      const newPreferences = {
        ...preferences,
        [key]: !preferences[key],
      };
      setPreferences(newPreferences);

      // Start saving
      setSaving(true);

      if (!user) {
        router.push("/sign-in");
        return;
      }

      const { error } = await updateNotificationPreferences(
        user.id,
        newPreferences
      );

      if (error) throw error;

      toast({
        title: "Preferencia actualizada",
        description:
          "Tu configuración de notificaciones se ha guardado correctamente.",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error saving preference:", error);
      // Revert the local state if there was an error
      setPreferences(preferences);
      toast({
        title: "Error",
        description: "No se pudo guardar tu preferencia. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <LoadingSpinner
          size="md"
          text="Cargando notificaciones..."
          showText={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Notificaciones</h1>

      {/* Notification Settings Card */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-gray-600 font-medium">Notificación</div>
          <div className="text-gray-600 font-medium">Estado</div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 items-center py-3 border-b border-gray-100">
            <div className="font-medium text-gray-800">Novedades de Minka</div>
            <div>
              <Switch
                id="news-updates"
                checked={preferences.newsUpdates}
                onCheckedChange={() => handleToggle("newsUpdates")}
                className="data-[state=checked]:bg-[#2c6e49]"
                disabled={saving}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center py-3">
            <div className="font-medium text-gray-800">
              Noticias de campañas
            </div>
            <div>
              <Switch
                id="campaign-updates"
                checked={preferences.campaignUpdates}
                onCheckedChange={() => handleToggle("campaignUpdates")}
                className="data-[state=checked]:bg-[#2c6e49]"
                disabled={saving}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Historial de notificaciones
        </h1>

        {notifications && notifications.length > 0 ? (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-l-4 ${
                    notification.read ? "border-gray-300" : "border-[#2c6e49]"
                  } pl-4 py-3 hover:bg-gray-50 transition-colors`}
                >
                  <h3 className="font-medium text-lg">{notification.title}</h3>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(notification.created_at).toLocaleDateString(
                      "es-ES",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg py-12 px-4 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-6">
              <Info className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-gray-800 text-lg text-center">
              No tienes notificaciones en este momento
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
