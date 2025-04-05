"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Clock,
  FileText,
  User,
  ChevronDown,
  Plus,
  X,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { ImageEditor } from "@/components/views/create-campaign/ImageEditor";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { useUpload } from "@/hooks/use-upload";
import { UploadProgress } from "@/components/views/create-campaign/UploadProgress";

export function CampaignVerificationView() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    isUploading,
    progress: uploadProgress,
    uploadedUrls,
    setUploadedUrls,
    uploadFile: hookUploadFile,
    uploadFiles,
  } = useUpload();

  // State for campaign that is being verified
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [campaignTitle, setCampaignTitle] = useState<string>("");

  // Add state for verification steps
  const [verificationStep, setVerificationStep] = useState(1);

  // Form states
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [idDocumentUrl, setIdDocumentUrl] = useState<string | null>(null);
  const [supportingDocs, setSupportingDocs] = useState<File[]>([]);
  const [supportingDocsUrls, setSupportingDocsUrls] = useState<string[]>([]);
  const [campaignStory, setCampaignStory] = useState<string>("");
  const [referenceContact, setReferenceContact] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);

  // Image editor states
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(
    null
  );
  const [isIdDocumentEditing, setIsIdDocumentEditing] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  const [isImageEditorLoading, setIsImageEditorLoading] = useState(false);
  const [editingImageType, setEditingImageType] = useState<
    "id" | "support" | null
  >(null);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);

  // Add a state to track the current uploading file
  const [currentUploadingFile, setCurrentUploadingFile] = useState<File | null>(
    null
  );
  const [progress, setProgress] = useState(0);

  // Get campaign ID from localStorage on mount
  useEffect(() => {
    const storedCampaignId =
      typeof window !== "undefined"
        ? localStorage.getItem("verificationCampaignId")
        : null;

    const storedCampaignTitle =
      typeof window !== "undefined"
        ? localStorage.getItem("verificationCampaignTitle")
        : null;

    if (storedCampaignId) {
      setCampaignId(storedCampaignId);

      // If we have a stored title, use it
      if (storedCampaignTitle) {
        setCampaignTitle(storedCampaignTitle);
      } else {
        // In a real app, you would fetch the campaign details here
        // For now, we'll use a placeholder
        setCampaignTitle("Campaña sin título");
      }
    } else {
      // If no campaign ID is found, redirect to campaigns page
      toast({
        title: "Error",
        description:
          "No se encontró la campaña para verificar. Por favor, selecciona una campaña primero.",
        variant: "destructive",
      });
      router.push("/dashboard/campaigns");
    }
  }, [router, toast]);

  // Start verification process - move to step 2
  const startVerification = () => {
    if (!campaignId) {
      toast({
        title: "Error",
        description: "No se encontró la campaña para verificar.",
        variant: "destructive",
      });
      return;
    }

    setVerificationStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Add the getImageType function back
  const getImageType = (file: File): "image" | "document" => {
    return file.type.startsWith("image/") ? "image" : "document";
  };

  // Update handleIdDocumentUpload to use this function
  const handleIdDocumentUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const isImage = getImageType(file) === "image";

    try {
      if (isImage) {
        // For images, open the image editor
        const objectUrl = URL.createObjectURL(file);
        setEditingImageUrl(objectUrl);
        setEditingImageType("id");
        setIsIdDocumentEditing(true);
      } else {
        // For non-image files (like PDFs), upload directly
        setIdDocumentFile(file);

        // Upload ID document using the hook
        const result = await hookUploadFile(file, (p) => setProgress(p));
        if (result.success) {
          setIdDocumentUrl(result.url);
          toast({
            title: "Documento subido",
            description: "El documento se ha subido correctamente.",
          });
        } else {
          throw new Error("No se pudo subir el documento");
        }
      }
    } catch (error) {
      console.error("Error uploading ID document:", error);
      toast({
        title: "Error al subir documento",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo subir el documento de identidad. Inténtalo de nuevo.",
        variant: "destructive",
      });

      // Reset the file input
      event.target.value = "";
    }
  };

  // Update save handlers for ID document edits
  const handleSaveIdDocumentImage = async (editedImageUrl: string) => {
    try {
      // Convert the edited image URL to a Blob
      const response = await fetch(editedImageUrl);
      const blob = await response.blob();

      // Create a File object from the Blob
      const file = new File([blob], "id-document.jpg", { type: "image/jpeg" });

      // Set the file in state and upload it
      setIdDocumentFile(file);
      setCurrentUploadingFile(file);
      setProgress(0);

      const result = await hookUploadFile(file, (p) => setProgress(p));

      if (result.success) {
        setIdDocumentUrl(result.url);

        toast({
          title: "Imagen guardada",
          description: "La imagen se ha guardado y subido correctamente.",
        });
      } else {
        throw new Error("No se pudo subir la imagen editada");
      }

      // Close the editor
      setIsIdDocumentEditing(false);
      setEditingImageUrl(null);
      setEditingImageType(null);
    } catch (error) {
      console.error("Error saving edited ID document image:", error);
      toast({
        title: "Error al guardar imagen",
        description:
          "No se pudo guardar la imagen editada. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setCurrentUploadingFile(null);
    }
  };

  // Update cancel handlers for ID document edits
  const handleCancelIdDocumentEdit = () => {
    setIsIdDocumentEditing(false);
    setEditingImageUrl(null);
    setEditingImageType(null);
  };

  const handleSupportingDocsUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) return;

    // Get the new files
    const filesList = Array.from(event.target.files);

    // Check if we should show the image editor for any images
    const imageFiles = filesList.filter((file) =>
      file.type.startsWith("image/")
    );

    const nonImageFiles = filesList.filter(
      (file) => !file.type.startsWith("image/")
    );

    // Add all files to supportingDocs state
    setSupportingDocs((prev) => [...prev, ...filesList]);

    // Handle non-image files (like PDFs)
    if (nonImageFiles.length > 0) {
      try {
        setIsSubmitting(true);

        // Upload all non-image files one by one to show progress
        for (const file of nonImageFiles) {
          setCurrentUploadingFile(file);
          setProgress(0);

          const result = await hookUploadFile(file, (p) => setProgress(p));

          if (!result.success) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          // Add the URL to the state
          setSupportingDocsUrls((prev) => [...prev, result.url]);

          toast({
            title: "Archivo subido",
            description: `${file.name} se ha subido correctamente.`,
          });
        }

        setCurrentUploadingFile(null);
      } catch (error) {
        console.error("Error uploading files:", error);
        toast({
          title: "Error al subir archivos",
          description:
            error instanceof Error
              ? error.message
              : "No se pudieron subir algunos archivos. Inténtalo de nuevo.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }

    // If there are images, open the image editor for the first one
    if (imageFiles.length > 0) {
      // Convert first image to data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setEditingImageType("support");
          setEditingImageUrl(e.target.result as string);
          setIsImageEditorOpen(true);
        }
      };
      reader.readAsDataURL(imageFiles[0]);
    }

    // Reset the input
    event.target.value = "";
  };

  // Update save handlers for supporting doc edits
  const handleSaveSupportingDocImage = async (editedImageUrl: string) => {
    try {
      // Convert the edited image URL to a Blob
      const response = await fetch(editedImageUrl);
      const blob = await response.blob();

      // Create a File object from the Blob
      const file = new File([blob], `supporting-doc-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      // Add the file to supporting docs and upload it
      setSupportingDocs([...supportingDocs, file]);
      setCurrentUploadingFile(file);
      setProgress(0);

      const result = await hookUploadFile(file, (p) => setProgress(p));

      if (result.success) {
        setSupportingDocsUrls((prev) => [...prev, result.url]);

        toast({
          title: "Imagen guardada",
          description: "La imagen se ha guardado y subido correctamente.",
        });
      } else {
        throw new Error("No se pudo subir la imagen editada");
      }

      // Close the editor
      setEditingImageIndex(null);
      setEditingImageUrl(null);
      setIsImageEditorOpen(false);
      setEditingImageType(null);
    } catch (error) {
      console.error("Error saving edited supporting document image:", error);
      toast({
        title: "Error al guardar imagen",
        description:
          "No se pudo guardar la imagen editada. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setCurrentUploadingFile(null);
    }
  };

  // Update cancel handlers for supporting doc edits
  const handleCancelSupportingDocEdit = () => {
    setEditingImageIndex(null);
    setEditingImageUrl(null);
    setIsImageEditorOpen(false);
    setEditingImageType(null);
  };

  const removeSupportingDoc = (index: number) => {
    setSupportingDocs((prev) => prev.filter((_, i) => i !== index));
    setSupportingDocsUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit verification request
  const handleSubmitVerification = async () => {
    if (!campaignId) {
      toast({
        title: "Error",
        description: "No se encontró la campaña para verificar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const verificationData = {
        campaignId,
        idDocumentUrl,
        supportingDocsUrls,
        campaignStory: campaignStory || undefined,
        referenceContactName: referenceContact.name || undefined,
        referenceContactEmail: referenceContact.email || undefined,
        referenceContactPhone: referenceContact.phone || undefined,
      };

      const response = await fetch("/api/campaign/verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verificationData),
        // Add credentials to ensure cookies are sent
        credentials: "include",
      });

      if (!response.ok) {
        // Try to get detailed error message
        let errorMessage = "Failed to submit verification request";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }

        // If 401 unauthorized, show specific message
        if (response.status === 401) {
          throw new Error(
            "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión e intenta nuevamente."
          );
        }

        throw new Error(errorMessage);
      }

      // Show verification submitted state
      setVerificationSubmitted(true);

      // Move to step 3 instead of showing modal
      setVerificationStep(3);

      // Clear localStorage
      localStorage.removeItem("verificationCampaignId");
      localStorage.removeItem("verificationCampaignTitle");
    } catch (error) {
      console.error("Error submitting verification:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo enviar la solicitud de verificación. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Separate function for sending verification from step 3
  const handleSendFinalVerification = async () => {
    setShowSubmitModal(true);
  };

  // Handle reference contact form submission
  const handleReferenceSubmit = () => {
    setShowReferenceModal(false);
    toast({
      title: "Contacto agregado",
      description: "Se ha agregado el contacto de referencia correctamente.",
    });
  };

  // Return to campaign after success
  const handleReturnToCampaign = () => {
    setShowSubmitModal(false);

    // Clear localStorage
    localStorage.removeItem("verificationCampaignId");
    localStorage.removeItem("verificationCampaignTitle");

    if (campaignId) {
      router.push(`/campaign/${campaignId}`);
    } else {
      router.push("/dashboard/campaigns");
    }
  };

  const handleCancelVerification = () => {
    setShowCancelModal(false);
    router.push("/dashboard/campaigns");
  };

  const faqs = [
    {
      id: "faq-1",
      question: "¿Por qué debería verificar mi campaña?",
      answer:
        "La verificación añade credibilidad y confianza a tu campaña, lo que puede resultar en más donaciones. Las campañas verificadas son promocionadas por Minka y tienen mayor visibilidad.",
    },
    {
      id: "faq-2",
      question: "¿Cuánto tiempo demora el proceso de verificación?",
      answer:
        "El proceso de verificación normalmente toma entre 24 y 48 horas hábiles, una vez que hayas enviado toda la documentación requerida.",
    },
    {
      id: "faq-3",
      question: "¿Qué sucede si se aprueba la verificación?",
      answer:
        "Tu campaña recibirá una insignia de verificación y será destacada en la plataforma, lo que puede aumentar la visibilidad y credibilidad.",
    },
  ];

  // Fix dataURLtoBlob function if it's used
  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Modify the uploadFile function to track the current file being uploaded
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setIsSubmitting(true);
      setCurrentUploadingFile(file);
      setProgress(0);

      // Use the same uploadFile method from the useUpload hook
      const result = await hookUploadFile(file, (p) => setProgress(p));

      if (!result.success) {
        throw new Error("Failed to upload file");
      }

      return result.url;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error al subir archivo",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo subir el archivo. Inténtalo de nuevo.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSubmitting(false);
      setCurrentUploadingFile(null);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-24">
      {/* Campaign Info Banner - Always displayed */}
      <div className="py-8">
        <div className="bg-[#f5f7e9] p-6 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-medium text-[#478C5C]">
                Campaña a verificar
              </h3>
              <p className="text-lg font-bold">{campaignTitle}</p>
            </div>
            <Button
              variant="outline"
              className="border-[#478C5C] text-[#478C5C]"
              onClick={() => router.push("/dashboard/campaigns")}
            >
              Cambiar campaña
            </Button>
          </div>
        </div>
      </div>

      {/* Benefits Section - Step 1 */}
      {verificationStep === 1 && (
        <div className="py-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Beneficios</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Asegura mayor confianza y visibilidad para tu causa. La
              verificación te ayuda a destacar y atraer más donaciones.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div>
                <div className="flex items-start gap-5 mb-3">
                  <div className="flex-shrink-0 mt-1">
                    <Image
                      src="/icons/verified.svg"
                      alt="Verificación"
                      width={32}
                      height={32}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2 text-[#478C5C]">
                      Genera confianza
                    </h3>
                    <p className="text-lg text-gray-600">
                      Los donadores se sienten más seguros al apoyar campañas
                      verificadas.
                    </p>
                  </div>
                </div>
                <div className="border-b border-gray-300 mt-4"></div>
              </div>

              <div>
                <div className="flex items-start gap-5 mb-3">
                  <div className="flex-shrink-0 mt-1">
                    <Image
                      src="/icons/heart.svg"
                      alt="Visibilidad"
                      width={48}
                      height={48}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2 text-[#478C5C]">
                      Mayor visibilidad
                    </h3>
                    <p className="text-lg text-gray-600">
                      Tu campaña será más visible dentro de la plataforma.
                    </p>
                  </div>
                </div>
                <div className="border-b border-gray-300 mt-4"></div>
              </div>

              <div>
                <div className="flex items-start gap-5 mb-3">
                  <div className="flex-shrink-0 mt-1">
                    <Image
                      src="/icons/support.svg"
                      alt="Apoyo"
                      width={64}
                      height={64}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2 text-[#478C5C]">
                      Más apoyo
                    </h3>
                    <p className="text-lg text-gray-600">
                      Las campañas verificadas suelen recibir más
                      contribuciones.
                    </p>
                  </div>
                </div>
                <div className="border-b border-gray-300 mt-4"></div>
              </div>

              <div className="pt-6">
                <div className="flex flex-row items-center gap-4">
                  <Button
                    className="bg-[#478C5C] hover:bg-[#356945] text-white rounded-full px-8 py-3 text-base font-medium"
                    onClick={startVerification}
                  >
                    Solicitar verificación
                  </Button>
                  <button
                    className="text-[#478C5C] hover:text-[#356945] font-bold text-base px-4 py-2"
                    onClick={() => router.push("/dashboard/campaigns")}
                  >
                    No quiero verificar mi campaña por ahora
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start justify-center">
              <Image
                src="/views/verify-campaign/benefits.svg"
                alt="Benefits illustration"
                width={450}
                height={450}
                className="h-auto w-auto object-contain"
              />
            </div>
          </div>

          <div className="mt-16 border-b border-[#478C5C]/20" />
        </div>
      )}

      {/* Steps Section - Step 1 */}
      {verificationStep === 1 && (
        <div className="py-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Pasos a seguir
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Verificar tu campaña es muy sencillo, solo debes seguir unos pocos
              pasos.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto pt-8 pb-12">
            {/* Horizontal line connecting the circles */}
            <div className="absolute top-16 left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-[2px] bg-[#478C5C]"></div>

            <div className="flex justify-between items-start">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center w-1/4">
                <div className="relative z-10 h-14 w-14 rounded-full border-2 border-[#478C5C] bg-white flex items-center justify-center mb-4">
                  <Image
                    src="/icons/doc.svg"
                    alt="Iniciar verificación"
                    width={32}
                    height={32}
                  />
                </div>
                <h3 className="text-base font-medium">Iniciar verificación</h3>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center w-1/4">
                <div className="relative z-10 h-14 w-14 rounded-full border-2 border-[#478C5C] bg-white flex items-center justify-center mb-4">
                  <Image
                    src="/icons/file_present.svg"
                    alt="Cargar documentación"
                    width={32}
                    height={32}
                  />
                </div>
                <h3 className="text-base font-medium">Cargar documentación</h3>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center w-1/4">
                <div className="relative z-10 h-14 w-14 rounded-full border-2 border-[#478C5C] bg-white flex items-center justify-center mb-4">
                  <Image
                    src="/icons/document_search.svg"
                    alt="Enviar solicitud"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-medium">Enviar solicitud</h3>
                  <p className="text-sm">y esperar revisión</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center w-1/4">
                <div className="relative z-10 h-14 w-14 rounded-full border-2 border-[#478C5C] bg-white flex items-center justify-center mb-4">
                  <Image
                    src="/icons/verified.svg"
                    alt="Obtener sello"
                    width={32}
                    height={32}
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-base font-medium">Obtener el sello</h3>
                  <p className="text-sm">de verificación</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 border-b border-[#478C5C]/20" />
        </div>
      )}

      {/* Requirements Section - Step 1 */}
      {verificationStep === 1 && (
        <div className="py-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Requisitos</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revisa los documentos y detalles necesarios antes de solicitar la
              verificación, para asegurar que tu campaña sea transparente y
              confiable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div>
                <div className="flex items-start gap-5 mb-3">
                  <div className="flex-shrink-0 mt-1">
                    <Image
                      src="/icons/badge.svg"
                      alt="Identificación"
                      width={48}
                      height={48}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2 text-[#478C5C]">
                      Identificación
                    </h3>
                    <p className="text-lg text-gray-600">
                      Sube tu documento de identidad o el del responsable.
                    </p>
                  </div>
                </div>
                <div className="border-b border-gray-300 mt-4"></div>
              </div>

              <div>
                <div className="flex items-start gap-5 mb-3">
                  <div className="flex-shrink-0 mt-1">
                    <Image
                      src="/icons/file_present.svg"
                      alt="Documentación"
                      width={48}
                      height={48}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2 text-[#478C5C]">
                      Documentación
                    </h3>
                    <p className="text-lg text-gray-600">
                      Adjunta documentos adicionales según el tipo de campaña.
                    </p>
                  </div>
                </div>
                <div className="border-b border-gray-300 mt-4"></div>
              </div>

              <div>
                <div className="flex items-start gap-5 mb-3">
                  <div className="flex-shrink-0 mt-1">
                    <Image
                      src="/icons/schedule.svg"
                      alt="Tiempo"
                      width={48}
                      height={48}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium mb-2 text-[#478C5C]">
                      Tiempo de verificación
                    </h3>
                    <p className="text-lg text-gray-600">
                      La verificación toma entre 1 y 2 días. La campaña seguirá
                      visible mientras se verifica.
                    </p>
                  </div>
                </div>
                <div className="border-b border-gray-300 mt-4"></div>
              </div>

              <div className="pt-6">
                <div className="flex flex-row items-center gap-4">
                  <Button
                    className="bg-[#478C5C] hover:bg-[#356945] text-white rounded-full px-8 py-3 text-base font-medium"
                    onClick={startVerification}
                  >
                    Solicitar verificación
                  </Button>
                  <button
                    className="text-[#478C5C] hover:text-[#356945] font-bold text-base px-4 py-2"
                    onClick={() => router.push("/dashboard/campaigns")}
                  >
                    No quiero verificar mi campaña por ahora
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start justify-center">
              <Image
                src="/views/verify-campaign/computadora.svg"
                alt="Requirements illustration"
                width={450}
                height={450}
                className="h-auto w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Verification Form Section - Step 2 */}
      {verificationStep === 2 && (
        <div className="py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Completa tu verificación
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Completa los datos requeridos para validar y fortalecer la
                credibilidad de tu campaña. El proceso es totalmente gratuito.
              </p>
            </div>

            {/* ID Document Upload */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-12">
              <div>
                <h3 className="text-2xl font-medium mb-4">
                  Documento de Identidad
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Adjunta la foto de tu Documento de Identidad para validar tu
                  información personal como responsable de la campaña.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-black p-8">
                {idDocumentFile ? (
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium">
                        {idDocumentFile.name}
                      </span>
                      <div className="flex gap-2">
                        {getImageType(idDocumentFile) === "image" && (
                          <button
                            onClick={() => {
                              const objectUrl =
                                URL.createObjectURL(idDocumentFile);
                              setEditingImageUrl(objectUrl);
                              setIsIdDocumentEditing(true);
                            }}
                            className="text-blue-500 hover:text-blue-700"
                            title="Editar imagen"
                          >
                            <FileText size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => setIdDocumentFile(null)}
                          className="text-red-500 hover:text-red-700"
                          title="Eliminar documento"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded p-2 flex items-center text-green-700">
                      <CheckCircle2 size={16} className="mr-2" />
                      <span className="text-sm">
                        Documento cargado correctamente
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-400 rounded-lg p-10 text-center bg-white"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.add("border-[#2c6e49]");
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.remove("border-[#2c6e49]");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.remove("border-[#2c6e49]");

                      if (
                        e.dataTransfer.files &&
                        e.dataTransfer.files.length > 0
                      ) {
                        // Create a synthetic event object to pass to the handler
                        const fileList = e.dataTransfer.files;
                        const event = {
                          target: {
                            files: fileList,
                          },
                        } as unknown as React.ChangeEvent<HTMLInputElement>;

                        handleIdDocumentUpload(event);
                      }
                    }}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Image
                        src="/icons/add_ad.svg"
                        alt="Add media"
                        width={42}
                        height={42}
                        className="mb-4"
                      />
                      <p className="text-sm text-gray-500 mb-4">
                        Arrastra o carga la foto de tu CI aquí
                      </p>
                      <p className="text-xs text-gray-400 mb-4">
                        Archivos JPG, PNG, PDF (máx. 10 MB)
                      </p>
                      <div>
                        <input
                          id="id-document-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleIdDocumentUpload}
                          className="hidden"
                        />
                        <Button
                          onClick={() =>
                            document
                              .getElementById("id-document-upload")
                              ?.click()
                          }
                          className="bg-[#2c6e49] hover:bg-[#235539] text-white rounded-full cursor-pointer"
                          type="button"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-2">
                              <InlineSpinner className="text-white" />
                              <span>Subiendo...</span>
                            </div>
                          ) : (
                            "Seleccionar"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* In the ID Document Upload UI section, add the progress indicator: */}
                {currentUploadingFile &&
                  currentUploadingFile === idDocumentFile && (
                    <div className="mt-4">
                      <UploadProgress
                        progress={progress}
                        fileName={currentUploadingFile.name}
                      />
                    </div>
                  )}
              </div>
            </div>
            <div className="mt-16 border-b border-[#478C5C]/20" />

            {/* Supporting Documents */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 my-12">
              <div>
                <h3 className="text-2xl font-medium mb-4">
                  Documentación de apoyo
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Adjunta los documentos que respalden la legitimidad de tu
                  campaña. Por ejemplo: cotizaciones, recibos, prescripciones
                  médicas, testimonios de escrituras públicas o cualquier otro
                  documento legal que demuestre la existencia de la necesidad y
                  del beneficiario.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-black p-8">
                <div
                  className="border-2 border-dashed border-gray-400 rounded-lg p-10 text-center bg-white mb-4"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.add("border-[#2c6e49]");
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove("border-[#2c6e49]");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove("border-[#2c6e49]");

                    if (
                      e.dataTransfer.files &&
                      e.dataTransfer.files.length > 0
                    ) {
                      // Create a synthetic event object to pass to the handler
                      const fileList = e.dataTransfer.files;
                      const event = {
                        target: {
                          files: fileList,
                        },
                      } as unknown as React.ChangeEvent<HTMLInputElement>;

                      handleSupportingDocsUpload(event);
                    }
                  }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <Image
                      src="/icons/add_ad.svg"
                      alt="Add media"
                      width={42}
                      height={42}
                      className="mb-4"
                    />
                    <p className="text-sm text-gray-500 mb-4">
                      Arrastra o sube tu foto aquí
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      Archivos JPG, PNG, PDF (máx. 10 MB)
                    </p>
                    <div>
                      <input
                        id="supporting-docs-upload"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleSupportingDocsUpload}
                        className="hidden"
                        multiple
                      />
                      <Button
                        onClick={() =>
                          document
                            .getElementById("supporting-docs-upload")
                            ?.click()
                        }
                        className="bg-[#2c6e49] hover:bg-[#235539] text-white rounded-full cursor-pointer"
                        type="button"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <InlineSpinner className="text-white" />
                            <span>Subiendo...</span>
                          </div>
                        ) : (
                          "Seleccionar"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* In the Supporting Documents Upload UI section, add the progress indicator: */}
                {currentUploadingFile &&
                  supportingDocs.some(
                    (doc) => doc === currentUploadingFile
                  ) && (
                    <div className="mt-4">
                      <UploadProgress
                        progress={progress}
                        fileName={currentUploadingFile.name}
                      />
                    </div>
                  )}

                {supportingDocs.length > 0 && (
                  <div className="space-y-3">
                    {/* Actual uploaded documents */}
                    {supportingDocs.map((doc, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-white border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            src="/icons/doc.svg"
                            alt="Document"
                            width={24}
                            height={24}
                          />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-gray-500">
                              {Math.round(doc.size / 1024)} KB
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {getImageType(doc) === "image" && (
                            <button
                              onClick={() => {
                                const objectUrl = URL.createObjectURL(doc);
                                setEditingImageUrl(objectUrl);
                                setEditingImageIndex(index);
                              }}
                              className="text-blue-500 hover:text-blue-700"
                              title="Editar imagen"
                            >
                              <FileText size={20} />
                            </button>
                          )}
                          <button
                            onClick={() => removeSupportingDoc(index)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-16 border-b border-[#478C5C]/20" />

            {/* Campaign History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 my-12">
              <div>
                <h3 className="text-2xl font-medium mb-4">
                  Historia de la campaña
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Describe cómo se van a emplear los fondos recaudados, por qué
                  esta campaña es importante para ti, cómo planeas llevarlo a
                  cabo y quién eres.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-black p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-medium mb-2">
                      Cuéntanos tu historia
                    </label>
                    <div className="relative">
                      <textarea
                        placeholder="Ejemplo: Su conservación depende de nosotros"
                        rows={4}
                        className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 p-4"
                        maxLength={500}
                        value={campaignStory}
                        onChange={(e) => setCampaignStory(e.target.value)}
                      />
                      <div className="text-sm text-gray-500 text-right mt-1">
                        {campaignStory.length}/500
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-16 border-b border-[#478C5C]/20" />

            {/* Contact Reference */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 my-12">
              <div>
                <h3 className="text-2xl font-medium mb-4">
                  Contacto de referencia (opcional)
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Incluye un contacto que pueda confirmar la autenticidad de tu
                  campaña.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-black p-8">
                {referenceContact.name ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Contacto de referencia</h4>
                      <button
                        onClick={() => setShowReferenceModal(true)}
                        className="text-[#478C5C] text-sm font-medium"
                      >
                        Editar
                      </button>
                    </div>
                    <div className="bg-[#f5f7e9] p-4 rounded-lg">
                      <p>
                        <span className="font-medium">Nombre:</span>{" "}
                        {referenceContact.name}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {referenceContact.email}
                      </p>
                      <p>
                        <span className="font-medium">Teléfono:</span>{" "}
                        {referenceContact.phone}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-6">
                      <p className="text-gray-600">
                        Aún no agregaste un contacto de referencia
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button
                        className="bg-[#2c6e49] hover:bg-[#235539] text-white rounded-full py-3"
                        onClick={() => setShowReferenceModal(true)}
                      >
                        Agregar contacto
                      </Button>
                      <div className="flex items-center justify-center mt-3">
                        <input
                          type="checkbox"
                          id="no-reference"
                          className="mr-2 h-4 w-4 text-[#478C5C] focus:ring-[#478C5C]"
                        />
                        <label
                          htmlFor="no-reference"
                          className="text-sm text-gray-600"
                        >
                          No quiero agregar una referencia por ahora.
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Final submission */}
            <div className="mt-12 max-w-3xl mx-auto">
              <div className="bg-white rounded-xl border border-black p-8">
                <div className="flex flex-col items-center text-center">
                  <Image
                    src="/icons/verified.svg"
                    alt="Verificación"
                    width={64}
                    height={64}
                    className="mb-4"
                  />
                  <p className="font-medium text-xl mb-4">
                    Tu solicitud de verificación está lista para ser enviada
                  </p>
                  <p className="text-gray-600 mb-8">
                    Una vez enviada tu solicitud, la revisión de tu campaña y su
                    documentación demorará entre 1 y 2 días. Mientras tanto, tu
                    campaña seguirá activa y disponible para recibir apoyo.
                  </p>
                  <div className="flex flex-col w-full gap-3 mt-4">
                    <Button
                      className="bg-[#2c6e49] hover:bg-[#235539] text-white rounded-full py-3"
                      onClick={handleSubmitVerification}
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Enviando solicitud..."
                        : "Enviar solicitud de verificación"}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#2c6e49] text-[#2c6e49] rounded-full py-3"
                      onClick={() => setVerificationStep(1)}
                      disabled={isSubmitting}
                    >
                      Regresar a información
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Section - Step 3 */}
      {verificationStep === 3 && (
        <div className="py-12">
          <div className="max-w-6xl mx-auto">
            <div className="bg-[#f5f7e9] rounded-xl border border-[#478C5C]/20 p-12 mt-8">
              <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
                <div className="w-24 h-24 mb-6">
                  <Image
                    src="/icons/handshake.svg"
                    alt="Verificación exitosa"
                    width={96}
                    height={96}
                  />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  ¡Tu solicitud de verificación está lista!
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  Una vez enviada tu solicitud, la revisión de tu campaña y su
                  documentación demorará un par de días. Mientras tanto, tu
                  campaña seguirá activa y disponible para recibir apoyo.
                </p>

                <div className="text-center p-4 border-t border-b border-gray-200 my-4 w-full">
                  <h3 className="text-green-700 font-semibold text-lg">
                    Tu solicitud ha sido completada correctamente
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-md mx-auto">
                  <Button
                    className="bg-[#478C5C] hover:bg-[#3a7049] text-white rounded-full py-3 px-8 w-full flex items-center justify-center"
                    onClick={handleSendFinalVerification}
                  >
                    <span>Enviar solicitud</span>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      className="ml-2"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Button>

                  <Button
                    variant="outline"
                    className="border-[#478C5C] text-[#478C5C] rounded-full py-3 px-8 w-full flex items-center justify-center"
                    onClick={() => setShowCancelModal(true)}
                  >
                    <span>Cancelar solicitud</span>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      className="ml-2"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z"
                        fill="currentColor"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      <div className="py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">Preguntas frecuentes</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Respuestas a las dudas más comunes sobre el proceso de verificación.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="mb-16">
            {faqs.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border-b border-[#478C5C]/20"
              >
                <AccordionTrigger className="text-xl font-medium text-[#2c6e49] hover:text-[#2c6e49]/90 py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-lg text-gray-600 py-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Reference Contact Modal */}
      {showReferenceModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white max-w-xl w-full mx-4 relative shadow-lg">
            {/* Cream-colored top bar with close button */}
            <div className="bg-[#f5f7e9] py-3 px-6 flex justify-between relative">
              <h3 className="text-xl font-semibold">
                Agregar contacto de referencia
              </h3>
              <button
                onClick={() => setShowReferenceModal(false)}
                className="text-[#478C5C] hover:text-[#2c6e49]"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main content area */}
            <div className="p-8">
              <p className="text-gray-600 mb-6">
                Proporciona los datos de una persona que pueda respaldar la
                autenticidad de tu campaña.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-base font-medium mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    placeholder="Ingresa el nombre de tu contacto"
                    className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 h-12 px-4"
                    value={referenceContact.name}
                    onChange={(e) =>
                      setReferenceContact({
                        ...referenceContact,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-base font-medium mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="nombre@correo.com"
                      className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 h-12 px-4"
                      value={referenceContact.email}
                      onChange={(e) =>
                        setReferenceContact({
                          ...referenceContact,
                          email: e.target.value,
                        })
                      }
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Eye className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <div className="inline-block w-4 h-4 mr-2 rounded-full border border-gray-400 flex-shrink-0 flex items-center justify-center">
                      <span className="text-gray-600 text-xs">i</span>
                    </div>
                    Selecciona el código de tu país.
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium mb-2">
                    Teléfono
                  </label>
                  <div className="flex">
                    <div className="flex items-center h-12 px-3 border border-black border-r-0 rounded-l-lg bg-white min-w-[95px]">
                      <div className="flex items-center">
                        <span className="inline-block mr-2">🇧🇴</span>
                        <span>+591</span>
                        <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <input
                      type="tel"
                      placeholder="Número de teléfono"
                      className="flex-1 h-12 rounded-l-none rounded-r-lg border border-black bg-white px-4 focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0"
                      value={referenceContact.phone}
                      onChange={(e) =>
                        setReferenceContact({
                          ...referenceContact,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <Image
                        src="/icons/info.svg"
                        alt="Information"
                        width={20}
                        height={20}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">
                          ¿Por qué es importante?
                        </span>{" "}
                        Agregar un contacto de referencia nos ayuda a confirmar
                        los datos de tu campaña. Esta información solo será
                        utilizada por el equipo de verificación y no se mostrará
                        públicamente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <Button
                  className="bg-[#478C5C] hover:bg-[#3a7049] text-white rounded-full py-2 px-8"
                  onClick={handleReferenceSubmit}
                >
                  Guardar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Request Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white max-w-xl w-full mx-4 relative shadow-lg">
            {/* Cream-colored top bar with close button */}
            <div className="bg-[#f5f7e9] py-3 px-6 flex justify-end relative">
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-[#478C5C] hover:text-[#2c6e49]"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main content area */}
            <div className="p-8">
              <div className="flex flex-col items-center text-center">
                <Image
                  src="/icons/info-icon.svg"
                  alt="Verificación cancelada"
                  width={48}
                  height={48}
                  className="mb-6"
                />
                <h2 className="text-3xl font-bold mb-4">
                  Verificación cancelada
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  Tu campaña no ha sido verificada. Por favor, revisa tu correo
                  electrónico para conocer los motivos. Y cuando estés listo,
                  puedes enviar una nueva solicitud de verificación.
                </p>

                <div className="w-full border-t border-gray-300 my-6"></div>

                <Button
                  className="bg-[#478C5C] hover:bg-[#3a7049] text-white rounded-full py-2 px-8"
                  onClick={() => setShowCancelModal(false)}
                >
                  Ver mi campaña
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add back the success modal with handshake icon */}
      {showSubmitModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
          <div className="bg-white max-w-xl w-full mx-4 relative shadow-lg rounded-lg overflow-hidden">
            {/* Cream-colored top bar with close button */}
            <div className="bg-[#f5f7e9] py-3 px-6 flex justify-end relative">
              <button
                onClick={handleReturnToCampaign}
                className="text-[#478C5C] hover:text-[#2c6e49]"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main content area */}
            <div className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 mb-6">
                  <Image
                    src="/icons/handshake.svg"
                    alt="Verificación exitosa"
                    width={80}
                    height={80}
                  />
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  ¡Solicitud enviada con éxito!
                </h2>
                <p className="text-gray-600 text-lg mb-4">
                  Tu solicitud de verificación para{" "}
                  <span className="font-semibold">{campaignTitle}</span> ha sido
                  recibida.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 w-full">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 text-blue-500">
                      <Clock size={24} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-blue-800 font-semibold mb-1">
                        Proceso de verificación en curso
                      </p>
                      <p className="text-sm text-blue-800">
                        Estamos revisando tu campaña y documentación. Este
                        proceso puede tomar hasta 2 días hábiles. Te enviaremos
                        una notificación cuando la verificación esté completa.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  Mientras tanto, tu campaña seguirá activa y disponible en la
                  plataforma para recibir apoyo.
                </p>

                <div className="w-full border-t border-gray-300 my-6"></div>

                <Button
                  className="bg-[#478C5C] hover:bg-[#3a7049] text-white rounded-full py-2 px-8"
                  onClick={handleReturnToCampaign}
                >
                  Ver mi campaña
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image editor modal */}
      {(isIdDocumentEditing || isImageEditorOpen) && editingImageUrl && (
        <ImageEditor
          imageUrl={editingImageUrl}
          onSave={
            editingImageType === "id"
              ? handleSaveIdDocumentImage
              : handleSaveSupportingDocImage
          }
          onCancel={
            editingImageType === "id"
              ? handleCancelIdDocumentEdit
              : handleCancelSupportingDocEdit
          }
          isLoading={isImageEditorLoading}
        />
      )}
    </div>
  );
}
