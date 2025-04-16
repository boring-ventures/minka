import { VerificationRequests } from "@/components/views/admin/VerificationRequests";
import { AdminDashboardLayout } from "@/components/layouts/AdminDashboardLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solicitudes de Verificación | Minka Admin",
  description: "Gestión de verificación de campañas en la plataforma Minka",
};

export default function VerificationRequestsPage() {
  return (
    <AdminDashboardLayout>
      <VerificationRequests />
    </AdminDashboardLayout>
  );
}
