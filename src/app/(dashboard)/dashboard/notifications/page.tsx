import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";

// This is a placeholder page since we don't have a notifications table in the schema yet
export default async function NotificationsPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Mock notifications for demonstration
  const notifications = [
    {
      id: 1,
      title: "Tu donación ha sido procesada",
      description:
        "Tu donación de $50 para la campaña 'Ayuda a las víctimas del terremoto' ha sido procesada exitosamente.",
      date: "2023-09-15T14:30:00",
      read: true,
    },
    {
      id: 2,
      title: "Nueva actualización en campaña",
      description:
        "La campaña 'Construyendo escuelas rurales' ha publicado una nueva actualización.",
      date: "2023-09-10T09:15:00",
      read: false,
    },
    {
      id: 3,
      title: "Campaña completada",
      description:
        "¡Felicidades! La campaña 'Reforestación del bosque' ha alcanzado su meta de financiamiento.",
      date: "2023-09-05T16:45:00",
      read: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-[#2c6e49] hover:text-[#1e4d33] flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          <span>Volver al perfil</span>
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Notificaciones</h1>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        {notifications && notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border-l-4 ${notification.read ? "border-gray-200" : "border-[#2c6e49]"} pl-4 py-3 hover:bg-gray-50 transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3
                      className={`font-medium ${notification.read ? "text-gray-600" : "text-gray-900"}`}
                    >
                      {notification.title}
                    </h3>
                    <p className="text-gray-500 mt-1">
                      {notification.description}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-[#2c6e49]"></span>
                  )}
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  {new Date(notification.date).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 flex flex-col items-center">
            <Bell size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-500">
              No tienes notificaciones en este momento
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
