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

export function CampaignVerificationView() {
  const router = useRouter();
  const { toast } = useToast();

  // State for campaign that is being verified
  const [campaignId, setCampaignId] = useState<string | null>(null);

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

  // Get campaign ID from localStorage on mount
  useEffect(() => {
    const storedCampaignId =
      typeof window !== "undefined"
        ? localStorage.getItem("verificationCampaignId")
        : null;

    if (storedCampaignId) {
      setCampaignId(storedCampaignId);
    }
  }, []);

  // Upload handlers
  const handleIdDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdDocumentFile(file);

      // Upload ID document to server
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload ID document");
        }

        const data = await response.json();
        setIdDocumentUrl(data.url);
      } catch (error) {
        console.error("Error uploading ID document:", error);
        toast({
          title: "Error al subir documento",
          description:
            "No se pudo subir el documento de identidad. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSupportingDocsUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSupportingDocs((prev) => [...prev, ...newFiles]);

      // Upload supporting docs to server
      try {
        const uploadedUrls = [];

        for (const file of newFiles) {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          const data = await response.json();
          uploadedUrls.push(data.url);
        }

        setSupportingDocsUrls((prev) => [...prev, ...uploadedUrls]);
      } catch (error) {
        console.error("Error uploading supporting documents:", error);
        toast({
          title: "Error al subir documentos",
          description:
            "No se pudieron subir algunos documentos de soporte. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    }
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
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to submit verification request"
        );
      }

      // Show success modal
      setShowSubmitModal(true);

      // Clear localStorage
      localStorage.removeItem("verificationCampaignId");
    } catch (error) {
      console.error("Error submitting verification:", error);
      toast({
        title: "Error",
        description:
          "No se pudo enviar la solicitud de verificación. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="w-full max-w-6xl mx-auto space-y-24">
      {/* Benefits Section */}
      <div className="py-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Beneficios</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Asegura mayor confianza y visibilidad para tu causa. La verificación
            te ayuda a destacar y atraer más donaciones.
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
                    Las campañas verificadas suelen recibir más contribuciones.
                  </p>
                </div>
              </div>
              <div className="border-b border-gray-300 mt-4"></div>
            </div>

            <div className="pt-6">
              <div className="flex flex-row items-center gap-4">
                <Button className="bg-[#478C5C] hover:bg-[#356945] text-white rounded-full px-8 py-3 text-base font-medium">
                  Solicitar verificación
                </Button>
                <button className="text-[#478C5C] hover:text-[#356945] font-bold text-base px-4 py-2">
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

      {/* Steps Section */}
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

      {/* Requirements Section */}
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
                <Button className="bg-[#478C5C] hover:bg-[#356945] text-white rounded-full px-8 py-3 text-base font-medium">
                  Solicitar verificación
                </Button>
                <button className="text-[#478C5C] hover:text-[#356945] font-bold text-base px-4 py-2">
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

      {/* Verification Form Section */}
      <div className="py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Inicia tu verificación ahora
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
                    <button
                      onClick={() => setIdDocumentFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded p-2 flex items-center text-green-700">
                    <CheckCircle2 size={16} className="mr-2" />
                    <span className="text-sm">
                      Documento cargado correctamente
                    </span>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-400 rounded-lg p-10 text-center bg-white">
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
                      Debe ser un archivo JPG o PNG, no mayor a 2 MB.
                    </p>
                    <div>
                      <input
                        id="id-document-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleIdDocumentUpload}
                        className="hidden"
                      />
                      <label htmlFor="id-document-upload">
                        <Button className="bg-[#2c6e49] hover:bg-[#235539] text-white rounded-full cursor-pointer">
                          Seleccionar
                        </Button>
                      </label>
                    </div>
                  </div>
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
              <div className="border-2 border-dashed border-gray-400 rounded-lg p-10 text-center bg-white mb-4">
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
                    Debe ser un archivo JPG, PNG. No mayor a 2 MB.
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
                    <label htmlFor="supporting-docs-upload">
                      <Button className="bg-[#2c6e49] hover:bg-[#235539] text-white rounded-full cursor-pointer">
                        Seleccionar
                      </Button>
                    </label>
                  </div>
                </div>
              </div>

              {supportingDocs.length > 0 && (
                <div className="space-y-3">
                  {/* Example of a document that's uploading */}
                  <div className="flex justify-between items-center bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/icons/doc.svg"
                        alt="Document"
                        width={24}
                        height={24}
                      />
                      <div>
                        <p className="font-medium">Comprobantes del pago.pdf</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-500">
                            60 KB de 120 KB
                          </p>
                          <span className="text-gray-500">•</span>
                          <div className="flex items-center">
                            <svg
                              className="animate-spin h-3 w-3 text-gray-500 mr-2"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span className="text-sm text-gray-500">
                              Cargando...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-500 hover:text-red-500">
                      <X size={20} />
                    </button>
                  </div>

                  {/* Example of a document with error */}
                  <div className="flex justify-between items-center bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/icons/doc.svg"
                        alt="Document"
                        width={24}
                        height={24}
                      />
                      <div>
                        <p className="font-medium">Certificación.pdf</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-500">
                            60 KB de 120 KB
                          </p>
                          <span className="text-gray-500">•</span>
                          <div className="flex items-center">
                            <span className="text-sm text-red-500 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Error de carga
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-500 hover:text-red-500">
                      <X size={20} />
                    </button>
                  </div>

                  {/* Example of a completed document */}
                  <div className="flex justify-between items-center bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/icons/doc.svg"
                        alt="Document"
                        width={24}
                        height={24}
                      />
                      <div>
                        <p className="font-medium">
                          Manifiesto medioambiental.pdf
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-500">
                            94 KB de 120 KB
                          </p>
                          <span className="text-gray-500">•</span>
                          <div className="flex items-center">
                            <span className="text-sm text-green-600 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Completado
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-500 hover:text-red-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

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
                            {Math.round(doc.size / 1024)} KB de 120 KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeSupportingDoc(index)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X size={20} />
                      </button>
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
                esta campaña es importante para ti, cómo planeas llevarlo a cabo
                y quién eres.
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
                      0/500
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 border-b border-[#478C5C]/20" />

          {/* Success Confirmation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 my-12">
            <div>
              <h3 className="text-2xl font-medium mb-4">
                ¡Tu solicitud de verificación está lista!
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Una vez enviada tu solicitud, la revisión de tu campaña y su
                documentación demorará un par de días. Mientras tanto, tu
                campaña seguirá activa y disponible para recibir apoyo.
              </p>
            </div>

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
                  Tu solicitud ha sido completada correctamente
                </p>
                <div className="flex flex-col w-full gap-3 mt-4">
                  <Button
                    className="bg-[#2c6e49] hover:bg-[#235539] text-white rounded-full py-3"
                    onClick={handleSubmitVerification}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Enviando solicitud..."
                      : "Enviar solicitud"}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#2c6e49] text-[#2c6e49] rounded-full py-3"
                    onClick={() => setShowCancelModal(true)}
                    disabled={isSubmitting}
                  >
                    Cancelar solicitud
                  </Button>
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
            </div>
          </div>
        </div>
      </div>

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

      {/* Submit Success Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white max-w-xl w-full mx-4 relative shadow-lg">
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
                <Image
                  src="/icons/handshake.svg"
                  alt="Solicitud enviada"
                  width={70}
                  height={70}
                  className="mb-6"
                />
                <h2 className="text-3xl font-bold mb-4">
                  ¡Solicitud enviada con éxito!
                </h2>
                <p className="text-gray-600 text-lg mb-8">
                  Estamos revisando tu campaña. La verificación puede tomar
                  hasta 2 días. Mientras tanto, tu campaña seguirá activa y
                  disponible en la plataforma.
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
    </div>
  );
}
