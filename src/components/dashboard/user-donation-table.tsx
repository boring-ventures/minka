"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PaymentStatus } from "@prisma/client";

// Define a simplified donation interface for user donations
export interface UserDonationData {
  id: string;
  amount: number;
  status: PaymentStatus | string;
  created_at: string;
  campaign: {
    id: string;
    title: string;
  };
}

interface UserDonationTableProps {
  donations: UserDonationData[];
}

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
  }).format(amount);
};

export function UserDonationTable({ donations }: UserDonationTableProps) {
  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "succeeded":
      case "successful":
        return "success";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Campaña</TableHead>
          <TableHead className="text-right">Monto</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fecha</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {donations.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={4}
              className="text-center text-muted-foreground py-8"
            >
              Aún no has realizado ninguna donación.
            </TableCell>
          </TableRow>
        ) : (
          donations.map((donation) => (
            <TableRow key={donation.id}>
              <TableCell className="font-medium">
                {donation.campaign?.title || "N/A"}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(donation.amount)}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(donation.status)}>
                  {donation.status === "succeeded"
                    ? "Exitoso"
                    : donation.status === "pending"
                      ? "Pendiente"
                      : donation.status === "failed"
                        ? "Fallido"
                        : donation.status || "Desconocido"}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(donation.created_at), "PPP", { locale: es })}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
