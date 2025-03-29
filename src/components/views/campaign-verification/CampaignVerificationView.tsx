"use client";

import { useState } from "react";
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
} from "lucide-react";
import Image from "next/image";

export function CampaignVerificationView() {
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [supportingDocs, setSupportingDocs] = useState<File[]>([]);
  const [faqExpanded, setFaqExpanded] = useState<number | null>(null);

  const handleIdDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdDocumentFile(e.target.files[0]);
    }
  };

  const handleSupportingDocsUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files) {
      setSupportingDocs((prev) => [
        ...prev,
        ...Array.from(e.target.files as FileList),
      ]);
    }
  };

  const removeSupportingDoc = (index: number) => {
    setSupportingDocs((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleFaq = (index: number) => {
    setFaqExpanded(faqExpanded === index ? null : index);
  };

  const faqs = [
    {
      question: "¿Por qué debería verificar mi campaña?",
      answer:
        "La verificación añade credibilidad y confianza a tu campaña, lo que puede resultar en más donaciones. Las campañas verificadas son promocionadas por Minka y tienen mayor visibilidad.",
    },
    {
      question: "¿Cuánto tiempo demora el proceso de verificación?",
      answer:
        "El proceso de verificación normalmente toma entre 24 y 48 horas hábiles, una vez que hayas enviado toda la documentación requerida.",
    },
    {
      question: "¿Qué sucede si se aprueba la verificación?",
      answer:
        "Tu campaña recibirá una insignia de verificación y será destacada en la plataforma, lo que puede aumentar la visibilidad y credibilidad.",
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="bg-[#2c6e49] text-white py-16 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Verifica tu campaña
          </h1>
          <div className="absolute bottom-0 right-0">
            <Image
              src="/social-media/Verificación de Campañas.png"
              alt="Verification illustration"
              width={300}
              height={150}
              className="h-auto w-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-[#f5f7e9] py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Beneficios</h2>
          <p className="text-gray-700 mb-8">
            Aumenta la imagen confiable y credibilidad para tu causa. La
            verificación te ayuda a destacar y atraer más donaciones.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="h-5 w-5 text-[#2c6e49]" />
                </div>
                <div>
                  <h3 className="font-medium">Mayor confianza</h3>
                  <p className="text-sm text-gray-600">
                    Los donantes se sienten más seguros al estar ofreciendo a
                    campañas verificadas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="h-5 w-5 text-[#2c6e49]" />
                </div>
                <div>
                  <h3 className="font-medium">Mejor visibilidad</h3>
                  <p className="text-sm text-gray-600">
                    Las campañas verificadas tienen mayor prioridad en los
                    resultados de búsqueda.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="h-5 w-5 text-[#2c6e49]" />
                </div>
                <div>
                  <h3 className="font-medium">Más apoyo</h3>
                  <p className="text-sm text-gray-600">
                    Las campañas verificadas reciben, en promedio,
                    sustancialmente más donaciones.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {/* Placeholder for illustration */}
              <div className="h-60 bg-gray-100 rounded-lg flex items-center justify-center">
                <Image
                  src="/social-media/Verificación de Campañas.png"
                  alt="Benefits illustration"
                  width={200}
                  height={200}
                  className="h-auto w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Pasos a seguir</h2>
          <p className="text-gray-700 mb-8">
            Verificar tu campaña es muy sencillo, solo debes seguir estos pasos:
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="h-16 w-16 rounded-full bg-[#2c6e49]/10 flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-[#2c6e49]" />
              </div>
              <h3 className="font-medium">Enviar documentos</h3>
              <p className="text-sm text-gray-600 mt-2">
                Sube tus documentos de identidad y aquellos que respalden tu
                campaña.
              </p>
            </div>

            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="h-16 w-16 rounded-full bg-[#2c6e49]/10 flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-[#2c6e49]" />
              </div>
              <h3 className="font-medium">Esperar verificación</h3>
              <p className="text-sm text-gray-600 mt-2">
                Nuestro equipo revisará tu documentación en un plazo de 24-48
                horas.
              </p>
            </div>

            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="h-16 w-16 rounded-full bg-[#2c6e49]/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-[#2c6e49]" />
              </div>
              <h3 className="font-medium">Recibir resultado</h3>
              <p className="text-sm text-gray-600 mt-2">
                Te informaremos por correo electrónico cuando tu campaña esté
                verificada.
              </p>
            </div>

            <div className="flex flex-col items-center text-center max-w-xs">
              <div className="h-16 w-16 rounded-full bg-[#2c6e49]/10 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-[#2c6e49]" />
              </div>
              <h3 className="font-medium">Obtener el sello</h3>
              <p className="text-sm text-gray-600 mt-2">
                Tu campaña recibirá un sello de verificación visible en tu
                perfil.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements Section */}
      <div className="bg-[#f5f7e9] py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Requisitos</h2>
          <p className="text-gray-700 mb-8">
            Necesitas los siguientes elementos y pruebas soportadas antes de
            solicitar la verificación, para asegurarte que tu campaña sea
            aceptada lo más rápido posible.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <User className="h-5 w-5 text-[#2c6e49]" />
                </div>
                <div>
                  <h3 className="font-medium">Identificación</h3>
                  <p className="text-sm text-gray-600">
                    Debes proporcionar tu documento de identidad o cédula.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <FileText className="h-5 w-5 text-[#2c6e49]" />
                </div>
                <div>
                  <h3 className="font-medium">Documentación</h3>
                  <p className="text-sm text-gray-600">
                    Pruebas documentales dependiendo del tipo de campaña, como
                    diagnósticos médicos si es para salud.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Clock className="h-5 w-5 text-[#2c6e49]" />
                </div>
                <div>
                  <h3 className="font-medium">Tiempo de verificación</h3>
                  <p className="text-sm text-gray-600">
                    El proceso de verificación normalmente toma entre 24 y 48
                    horas hábiles.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Image
                src="/social-media/Verificación de Campañas.png"
                alt="Requirements illustration"
                width={300}
                height={300}
                className="h-auto w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Verification Form */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Inicia tu verificación ahora
          </h2>
          <p className="text-gray-700 mb-8">
            Completa los datos requeridos para iniciar tu proceso de
            verificación de tu campaña. El proceso es totalmente gratuito.
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-4">Documento de identidad</h3>
              <p className="text-gray-600 mb-6">
                Adjunta una fotografía o escaneo de tu documento de identidad
                (DNI, cédula, pasaporte). El documento debe estar vigente.
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white">
                {idDocumentFile ? (
                  <div className="flex flex-col items-center">
                    <div className="bg-gray-100 rounded-lg p-4 mb-4 w-full flex justify-between items-center">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-700 truncate max-w-[200px]">
                          {idDocumentFile.name}
                        </span>
                      </div>
                      <button
                        onClick={() => setIdDocumentFile(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <Button
                      className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full"
                      onClick={() => setIdDocumentFile(null)}
                    >
                      Cambiar archivo
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500 mb-4">
                      Arrastra y suelta tu documento aquí, o haz clic para
                      seleccionarlo
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      Formatos aceptados: JPG, PNG, PDF (máx. 5 MB)
                    </p>
                    <Button
                      variant="outline"
                      className="bg-[#2c6e49] text-white hover:bg-[#1e4d33] border-0 rounded-full relative"
                      onClick={() =>
                        document.getElementById("id-document-upload")?.click()
                      }
                    >
                      Seleccionar archivo
                      <input
                        id="id-document-upload"
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleIdDocumentUpload}
                      />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4">Documentación de apoyo</h3>
              <p className="text-gray-600 mb-6">
                Añade cualquier documentación que respalde tu campaña. Si es
                para salud, puedes incluir diagnósticos médicos; si es para
                causas sociales o ambientales, añade información relevante.
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white">
                <div className="flex flex-col items-center">
                  {supportingDocs.length > 0 ? (
                    <div className="w-full mb-4">
                      {supportingDocs.map((doc, index) => (
                        <div
                          key={index}
                          className="bg-gray-100 rounded-lg p-3 mb-2 w-full flex justify-between items-center"
                        >
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-700 truncate max-w-[200px]">
                              {doc.name}
                            </span>
                          </div>
                          <button
                            onClick={() => removeSupportingDoc(index)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-sm text-gray-500 mb-4">
                        Arrastra y suelta tus documentos aquí, o haz clic para
                        seleccionarlos
                      </p>
                      <p className="text-xs text-gray-400 mb-4">
                        Formatos aceptados: JPG, PNG, PDF (máx. 5 MB por
                        archivo)
                      </p>
                    </>
                  )}
                  <Button
                    variant="outline"
                    className="bg-[#2c6e49] text-white hover:bg-[#1e4d33] border-0 rounded-full relative"
                    onClick={() =>
                      document.getElementById("supporting-docs-upload")?.click()
                    }
                  >
                    {supportingDocs.length > 0
                      ? "Añadir más archivos"
                      : "Seleccionar archivos"}
                    <input
                      id="supporting-docs-upload"
                      type="file"
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.pdf"
                      multiple
                      onChange={handleSupportingDocsUpload}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-bold mb-4">Historia de la campaña</h3>
            <p className="text-gray-600 mb-6">
              Describe brevemente cómo surgió tu campaña. Este texto nos ayudará
              a entender mejor tu causa y facilitar el proceso de verificación.
            </p>
            <textarea
              rows={4}
              placeholder="Comparte tu historia aquí..."
              className="flex w-full rounded-md border border-black bg-transparent px-3 py-2 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#478C5C] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          </div>

          <div className="mt-12 bg-[#f5f7e9] p-8 rounded-lg text-center">
            <div className="flex flex-col items-center mb-6">
              <CheckCircle2 className="h-16 w-16 text-[#2c6e49] mb-4" />
              <h3 className="text-2xl font-bold">
                ¡Tu solicitud de verificación está lista!
              </h3>
              <p className="text-gray-600 mt-2">
                ¡Genial! Tu documentación se subirá para ser revisada por
                nuestro equipo. Te notificaremos por correo electrónico sobre el
                estado de tu solicitud.
              </p>
            </div>
            <Button className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full py-2 px-8">
              Enviar solicitud
            </Button>
          </div>

          <div className="mt-12">
            <h3 className="text-xl font-bold mb-4">
              Contacto de referencia (opcional)
            </h3>
            <p className="text-gray-600 mb-6">
              Puedes proporcionar un contacto que pueda verificar la información
              proporcionada. Esto puede agilizar el proceso de verificación.
            </p>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Nombre completo"
                  className="flex h-11 w-full rounded-md border border-black bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#478C5C] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  className="flex h-11 w-full rounded-md border border-black bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#478C5C] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                />
              </div>
              <input
                type="text"
                placeholder="Teléfono"
                className="flex h-11 w-full rounded-md border border-black bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#478C5C] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm mb-4"
              />
              <Button
                variant="outline"
                className="border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49]/10 rounded-full"
              >
                Guardar contacto
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-[#f5f7e9] py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Preguntas frecuentes</h2>
          <p className="text-gray-700 mb-8">
            Resuelve tus dudas sobre el proceso de verificación de campañas.
          </p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white"
              >
                <button
                  className="flex justify-between items-center w-full px-6 py-4 text-left"
                  onClick={() => toggleFaq(index)}
                >
                  <h3 className="text-lg font-medium">{faq.question}</h3>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform ${faqExpanded === index ? "rotate-180" : ""}`}
                  />
                </button>
                {faqExpanded === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
