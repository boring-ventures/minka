"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Mail, Bell, Users, Info, Check } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

interface NotificationTemplate {
  id: string;
  title: string;
  content: string;
  target: "all" | "donors" | "organizers" | "admins";
  createdAt: string;
}

interface SentNotification {
  id: string;
  title: string;
  content: string;
  sentAt: string;
  recipientCount: number;
  target: "all" | "donors" | "organizers" | "admins";
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [sentNotifications, setSentNotifications] = useState<
    SentNotification[]
  >([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<NotificationTemplate | null>(null);

  // State for new notification form
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationContent, setNotificationContent] = useState("");
  const [notificationTarget, setNotificationTarget] = useState<
    "all" | "donors" | "organizers" | "admins"
  >("all");

  // State for confirmation dialog
  const [showDialog, setShowDialog] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersWithNewsUpdates: 0,
    usersWithCampaignUpdates: 0,
  });

  useEffect(() => {
    const checkAdminAndLoadData = async () => {
      if (!user) {
        router.push("/sign-in");
        return;
      }

      try {
        setLoading(true);

        // Check if user is admin
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!profile || profile.role !== "admin") {
          router.push("/dashboard/notifications");
          return;
        }

        setIsAdmin(true);

        // In a real application, fetch templates and sent notifications from the database
        // For now, let's use placeholder data

        // Get notification stats
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("id");

        if (usersError) throw usersError;

        const { data: preferencesData, error: preferencesError } =
          await supabase.from("notification_preferences").select("*");

        if (preferencesError) throw preferencesError;

        // Calculate stats
        const totalUsers = usersData?.length || 0;
        const usersWithNewsUpdates =
          preferencesData?.filter((p) => p.news_updates).length || 0;
        const usersWithCampaignUpdates =
          preferencesData?.filter((p) => p.campaign_updates).length || 0;

        setStats({
          totalUsers,
          usersWithNewsUpdates,
          usersWithCampaignUpdates,
        });

        // Sample template data (in a real app, fetch from database)
        const sampleTemplates: NotificationTemplate[] = [
          {
            id: "1",
            title: "Nueva funcionalidad: Compartir campaña",
            content:
              "Ahora puedes compartir tus campañas favoritas directamente en redes sociales con un solo clic.",
            target: "all",
            createdAt: "2023-06-15T10:30:00Z",
          },
          {
            id: "2",
            title: "Actualización de plataforma",
            content:
              "Hemos mejorado la velocidad y rendimiento de Minka. Ahora disfrutarás de una experiencia más fluida.",
            target: "all",
            createdAt: "2023-07-20T14:45:00Z",
          },
          {
            id: "3",
            title: "Consejos para organizadores",
            content:
              "Descubre cómo aumentar la visibilidad de tu campaña con estos 5 consejos prácticos.",
            target: "organizers",
            createdAt: "2023-08-10T09:15:00Z",
          },
          {
            id: "4",
            title: "Nuevas opciones de pago",
            content:
              "Ahora aceptamos QR y transferencias bancarias para facilitar tus donaciones.",
            target: "donors",
            createdAt: "2023-09-05T16:20:00Z",
          },
        ];

        const sampleSentNotifications: SentNotification[] = [
          {
            id: "1",
            title: "Lanzamiento de Minka 2.0",
            content:
              "Nos complace anunciar el lanzamiento de Minka 2.0 con nuevas funcionalidades y un diseño renovado.",
            sentAt: "2023-05-10T08:30:00Z",
            recipientCount: 342,
            target: "all",
          },
          {
            id: "2",
            title: "Mantenimiento programado",
            content:
              "El sistema estará en mantenimiento el día 15 de agosto de 10:00 a 12:00.",
            sentAt: "2023-08-01T11:45:00Z",
            recipientCount: 156,
            target: "all",
          },
          {
            id: "3",
            title: "Guía para organizar campañas exitosas",
            content:
              "Descubre cómo crear campañas que generen un mayor impacto y alcancen sus metas.",
            sentAt: "2023-09-15T14:20:00Z",
            recipientCount: 78,
            target: "organizers",
          },
        ];

        setTemplates(sampleTemplates);
        setSentNotifications(sampleSentNotifications);
      } catch (error) {
        console.error("Error loading admin notifications data:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos. Intente nuevamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndLoadData();
  }, [user, router, supabase, toast]);

  // Handle sending notification
  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationContent.trim()) {
      toast({
        title: "Campos incompletos",
        description:
          "Por favor complete el título y contenido de la notificación.",
        variant: "destructive",
      });
      return;
    }

    setShowDialog(true);
  };

  // Confirm and send notification
  const confirmSendNotification = async () => {
    setIsSending(true);

    try {
      // In a real application, this would call an API to send the notification
      // For now, simulate a delay and success
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create a new sent notification entry
      const newSentNotification: SentNotification = {
        id: `sent-${Date.now()}`,
        title: notificationTitle,
        content: notificationContent,
        sentAt: new Date().toISOString(),
        recipientCount:
          notificationTarget === "all"
            ? stats.totalUsers
            : notificationTarget === "donors"
              ? Math.round(stats.totalUsers * 0.7)
              : notificationTarget === "organizers"
                ? Math.round(stats.totalUsers * 0.2)
                : Math.round(stats.totalUsers * 0.05),
        target: notificationTarget,
      };

      // Update state
      setSentNotifications((prev) => [newSentNotification, ...prev]);

      // Reset form
      setNotificationTitle("");
      setNotificationContent("");
      setNotificationTarget("all");

      // Show success message
      toast({
        title: "Notificación enviada",
        description: `La notificación ha sido enviada a ${newSentNotification.recipientCount} usuarios.`,
      });

      // Close dialog
      setShowDialog(false);
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar la notificación. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Use template
  const useTemplate = (template: NotificationTemplate) => {
    setNotificationTitle(template.title);
    setNotificationContent(template.content);
    setNotificationTarget(template.target);

    toast({
      title: "Plantilla cargada",
      description: "La plantilla se ha cargado en el formulario.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return <div>Redirigiendo...</div>;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-3xl font-bold text-gray-800">
        Gestión de Notificaciones
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-blue-600 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Total de usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-green-600 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Suscriptores de novedades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.usersWithNewsUpdates}
            </div>
            <p className="text-xs text-muted-foreground">
              {((stats.usersWithNewsUpdates / stats.totalUsers) * 100).toFixed(
                1
              )}
              % de usuarios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-orange-600 flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Suscriptores de campañas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.usersWithCampaignUpdates}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                (stats.usersWithCampaignUpdates / stats.totalUsers) *
                100
              ).toFixed(1)}
              % de usuarios
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="send" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="send">Enviar Notificación</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nueva Notificación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título</label>
                <Input
                  placeholder="Ingrese el título de la notificación"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contenido</label>
                <Textarea
                  placeholder="Escriba el contenido de la notificación"
                  className="min-h-[120px]"
                  value={notificationContent}
                  onChange={(e) => setNotificationContent(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Destinatarios</label>
                <Select
                  value={notificationTarget}
                  onValueChange={(
                    value: "all" | "donors" | "organizers" | "admins"
                  ) => setNotificationTarget(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione los destinatarios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los usuarios</SelectItem>
                    <SelectItem value="donors">Solo donadores</SelectItem>
                    <SelectItem value="organizers">
                      Solo organizadores
                    </SelectItem>
                    <SelectItem value="admins">Solo administradores</SelectItem>
                  </SelectContent>
                </Select>

                <p className="text-xs text-muted-foreground mt-1">
                  <Info className="inline-block mr-1 h-3 w-3" />
                  Solo se enviará a usuarios que han activado las notificaciones
                </p>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSendNotification}
                  className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Notificación
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Título</TableHead>
                  <TableHead className="w-[500px]">Contenido</TableHead>
                  <TableHead>Destinatarios</TableHead>
                  <TableHead>Fecha creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">
                      {template.title}
                    </TableCell>
                    <TableCell className="truncate max-w-xs">
                      {template.content}
                    </TableCell>
                    <TableCell>
                      {template.target === "all"
                        ? "Todos"
                        : template.target === "donors"
                          ? "Donadores"
                          : template.target === "organizers"
                            ? "Organizadores"
                            : "Administradores"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(template.createdAt), "dd/MM/yyyy", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => useTemplate(template)}
                      >
                        Usar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Título</TableHead>
                  <TableHead className="w-[400px]">Contenido</TableHead>
                  <TableHead>Fecha envío</TableHead>
                  <TableHead>Destinatarios</TableHead>
                  <TableHead>Alcance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sentNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">
                      {notification.title}
                    </TableCell>
                    <TableCell className="truncate max-w-xs">
                      {notification.content}
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(notification.sentAt),
                        "dd/MM/yyyy HH:mm",
                        { locale: es }
                      )}
                    </TableCell>
                    <TableCell>
                      {notification.target === "all"
                        ? "Todos"
                        : notification.target === "donors"
                          ? "Donadores"
                          : notification.target === "organizers"
                            ? "Organizadores"
                            : "Administradores"}
                    </TableCell>
                    <TableCell>
                      {notification.recipientCount} usuarios
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar envío de notificación</DialogTitle>
            <DialogDescription>
              Esta notificación será enviada a todos los usuarios que han
              activado las notificaciones.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Título</h4>
              <p className="font-medium">{notificationTitle}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Contenido</h4>
              <p>{notificationContent}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">
                Destinatarios
              </h4>
              <p>
                {notificationTarget === "all"
                  ? "Todos los usuarios"
                  : notificationTarget === "donors"
                    ? "Solo donadores"
                    : notificationTarget === "organizers"
                      ? "Solo organizadores"
                      : "Solo administradores"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isSending}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmSendNotification}
              disabled={isSending}
              className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white"
            >
              {isSending ? (
                <>
                  <LoadingSpinner className="mr-2" size="sm" />
                  Enviando...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Confirmar envío
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
