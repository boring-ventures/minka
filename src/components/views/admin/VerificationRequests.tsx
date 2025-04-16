"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import Link from "next/link";

interface VerificationRequest {
  id: string;
  campaign: {
    id: string;
    title: string;
    image_url: string;
  };
  requestDate: string;
  status: "pending" | "approved" | "rejected";
  idDocumentUrl: string | null;
  supportingDocsUrls: string[];
  campaignStory: string | null;
  referenceContactName: string | null;
  referenceContactEmail: string | null;
  referenceContactPhone: string | null;
}

export function VerificationRequests() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<VerificationRequest | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewingImageUrl, setViewingImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  const fetchVerificationRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/verification-requests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch verification requests");
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Error fetching verification requests:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las solicitudes de verificación.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleApprove = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setNotes("");
    setIsApproveDialogOpen(true);
  };

  const handleReject = (request: VerificationRequest) => {
    setSelectedRequest(request);
    setNotes("");
    setIsRejectDialogOpen(true);
  };

  const submitVerificationStatus = async (status: "approved" | "rejected") => {
    if (!selectedRequest) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/campaign/verification/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          campaignId: selectedRequest.campaign.id,
          status,
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to update verification status"
        );
      }

      toast({
        title:
          status === "approved"
            ? "Verificación aprobada"
            : "Verificación rechazada",
        description:
          status === "approved"
            ? "La campaña ha sido verificada exitosamente."
            : "La solicitud de verificación ha sido rechazada.",
      });

      // Close dialogs and refresh data
      setIsApproveDialogOpen(false);
      setIsRejectDialogOpen(false);
      await fetchVerificationRequests();
    } catch (error) {
      console.error(
        `Error ${status === "approved" ? "approving" : "rejecting"} verification:`,
        error
      );
      toast({
        title: "Error",
        description: `No se pudo ${status === "approved" ? "aprobar" : "rechazar"} la solicitud de verificación.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const viewImage = (url: string) => {
    setViewingImageUrl(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
            Pendiente
          </span>
        );
      case "approved":
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            Aprobada
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
            Rechazada
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
            Desconocido
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Solicitudes de Verificación</h2>
        <Button onClick={fetchVerificationRequests} variant="outline">
          Actualizar
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <InlineSpinner className="text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No hay solicitudes de verificación pendientes.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaña</TableHead>
              <TableHead>Fecha de solicitud</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden relative">
                      <Image
                        src={
                          request.campaign.image_url || "/placeholder-image.png"
                        }
                        alt={request.campaign.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="truncate max-w-[200px]">
                      {request.campaign.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(request.requestDate)}</TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(request)}
                    >
                      Ver detalles
                    </Button>
                    {request.status === "pending" && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(request)}
                        >
                          Aprobar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(request)}
                        >
                          Rechazar
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles de Verificación</DialogTitle>
            <DialogDescription>
              Solicitud para la campaña: {selectedRequest?.campaign.title}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 pt-4">
              {/* Campaign Link */}
              <div>
                <h3 className="font-semibold mb-2">Campaña:</h3>
                <Link
                  href={`/campaign/${selectedRequest.campaign.id}`}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                >
                  Ver campaña en el sitio
                </Link>
              </div>

              {/* ID Document */}
              <div>
                <h3 className="font-semibold mb-2">Documento de identidad:</h3>
                {selectedRequest.idDocumentUrl ? (
                  <div className="grid grid-cols-1 gap-2">
                    <div
                      className="relative h-40 bg-gray-100 rounded cursor-pointer"
                      onClick={() => viewImage(selectedRequest.idDocumentUrl!)}
                    >
                      <Image
                        src={selectedRequest.idDocumentUrl}
                        alt="Documento de identidad"
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No se ha proporcionado documento de identidad.
                  </p>
                )}
              </div>

              {/* Supporting Documents */}
              <div>
                <h3 className="font-semibold mb-2">Documentos de respaldo:</h3>
                {selectedRequest.supportingDocsUrls.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedRequest.supportingDocsUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative h-40 bg-gray-100 rounded cursor-pointer"
                        onClick={() => viewImage(url)}
                      >
                        <Image
                          src={url}
                          alt={`Documento de respaldo ${index + 1}`}
                          fill
                          className="object-contain rounded"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No se han proporcionado documentos de respaldo.
                  </p>
                )}
              </div>

              {/* Campaign Story */}
              {selectedRequest.campaignStory && (
                <div>
                  <h3 className="font-semibold mb-2">
                    Historia de la campaña:
                  </h3>
                  <div className="p-4 bg-gray-50 rounded text-sm">
                    {selectedRequest.campaignStory}
                  </div>
                </div>
              )}

              {/* Reference Contact */}
              {selectedRequest.referenceContactName && (
                <div>
                  <h3 className="font-semibold mb-2">
                    Contacto de referencia:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Nombre:</span>{" "}
                      {selectedRequest.referenceContactName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedRequest.referenceContactEmail}
                    </div>
                    <div>
                      <span className="font-medium">Teléfono:</span>{" "}
                      {selectedRequest.referenceContactPhone}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar Verificación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas aprobar la verificación de la campaña "
              {selectedRequest?.campaign.title}"?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">
              Notas (opcional):
            </label>
            <Textarea
              placeholder="Agrega notas o comentarios sobre la aprobación..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => submitVerificationStatus("approved")}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <InlineSpinner className="mr-2" />
                  Aprobando...
                </>
              ) : (
                "Aprobar Verificación"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Verificación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas rechazar la verificación de la campaña "
              {selectedRequest?.campaign.title}"?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-2">
              Motivo del rechazo:
            </label>
            <Textarea
              placeholder="Explica por qué estás rechazando esta solicitud..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
              rows={3}
              required
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => submitVerificationStatus("rejected")}
              disabled={isSubmitting || !notes.trim()}
            >
              {isSubmitting ? (
                <>
                  <InlineSpinner className="mr-2" />
                  Rechazando...
                </>
              ) : (
                "Rechazar Verificación"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog
        open={!!viewingImageUrl}
        onOpenChange={(open) => !open && setViewingImageUrl(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Vista de Documento</DialogTitle>
          </DialogHeader>
          {viewingImageUrl && (
            <div className="relative h-[70vh] w-full">
              <Image
                src={viewingImageUrl}
                alt="Document preview"
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
