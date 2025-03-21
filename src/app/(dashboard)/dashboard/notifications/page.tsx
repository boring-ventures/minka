import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Info } from "lucide-react";

// This is a placeholder page since we don't have a notifications table in the schema yet
export default async function NotificationsPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  // Get user's notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

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
  const displayNotifications =
    process.env.NODE_ENV === "development"
      ? placeholderNotifications
      : notifications;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Notificaciones</h1>

      {displayNotifications && displayNotifications.length > 0 ? (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            {displayNotifications.map((notification) => (
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
  );
}
