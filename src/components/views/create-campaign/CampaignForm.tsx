"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  User,
  Users,
  Building2,
  X,
  ChevronDown,
  ChevronLeft,
  Upload,
  Check,
  Link as LinkIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCampaign, CampaignFormData } from "@/hooks/use-campaign";
import { useUpload } from "@/hooks/use-upload";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { UploadProgress } from "./UploadProgress";
import { ImageEditor } from "./ImageEditor";
import { YouTubeLinks } from "./YouTubeLinks";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

// Update the form sections (showing only the modified parts)
export function CampaignForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { isCreating, campaignId, createCampaign, saveCampaignDraft } =
    useCampaign();
  const { isUploading, progress, uploadedUrls, uploadFile, uploadFiles } =
    useUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CampaignFormData>({
    title: "",
    description: "",
    category: "",
    goalAmount: "",
    location: "",
    endDate: "",
    story: "",
    recipient: "",
    youtubeUrl: "",
    youtubeUrls: [],
    beneficiariesDescription: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showOtraPersonaModal, setShowOtraPersonaModal] = useState(false);
  const [showONGsModal, setShowONGsModal] = useState(false);

  // Add state to track form validity for each step
  const [isStep1Valid, setIsStep1Valid] = useState(false);
  const [isStep2Valid, setIsStep2Valid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviewUrls, setMediaPreviewUrls] = useState<string[]>([]);

  // Add new state for image editing
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(
    null
  );

  // Check step 1 validity
  useEffect(() => {
    // Basic validation for required fields in step 1
    const isValid =
      formData.title.length >= 3 &&
      formData.description.length >= 10 &&
      formData.category !== "" &&
      formData.story.length >= 10;

    setIsStep1Valid(isValid);
  }, [formData]);

  // Set step 2 valid to true by default as recipient selection is optional
  useEffect(() => {
    setIsStep2Valid(true);
  }, [formData.recipient]);

  const handlePublish = async () => {
    try {
      setIsSubmitting(true);

      // Map form data to API format
      const formattedData: CampaignFormData = {
        ...formData,
        title: formData.title,
        description: formData.description,
        category: formData.category || "medioambiente", // Default category
        goalAmount: formData.goalAmount || 1000, // Default amount
        location: formData.location,
        endDate:
          formData.endDate ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        story: formData.story,
        beneficiariesDescription: formData.story, // Use story as beneficiaries description for now
        mediaFiles: mediaFiles,
      };

      // Create the campaign
      const newCampaignId = await createCampaign({
        ...formattedData,
        // In a real implementation, use the actual uploaded URLs
        // For this implementation, we're using the mock URLs from the useUpload hook
        media: uploadedUrls.map((url, index) => ({
          mediaUrl: url,
          type: "image" as const,
          isPrimary: index === 0, // First image is primary
          orderIndex: index,
        })),
      });

      if (newCampaignId) {
        setShowSuccessModal(true);
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear la campaña. Intenta nuevamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al crear la campaña.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    // Redirect to the campaign page if we have a campaign ID
    if (campaignId) {
      router.push(`/campaign/${campaignId}`);
    }
  };

  const closeOtraPersonaModal = () => {
    setShowOtraPersonaModal(false);
  };

  const closeONGsModal = () => {
    setShowONGsModal(false);
  };

  const nextStep = async () => {
    if (currentStep === 1 && !isStep1Valid) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 1) {
      try {
        setIsSubmitting(true);
        // Save draft before proceeding to step 2
        const draftData = {
          ...formData,
          // For drafts, also include media information
          media: uploadedUrls.map((url, index) => ({
            mediaUrl: url,
            type: "image" as const,
            isPrimary: index === 0,
            orderIndex: index,
          })),
        };
        await saveCampaignDraft(draftData);
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      } catch (error) {
        console.error("Error saving draft:", error);
        toast({
          title: "Error",
          description: "Ocurrió un error al guardar el borrador.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Skip this section - step 2 to 3 transition is now handled by recipient selection

    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Basic validation
    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit
      toast({
        title: "Archivo muy grande",
        description: "El archivo es demasiado grande. El tamaño máximo es 2MB.",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.includes("image/")) {
      toast({
        title: "Formato inválido",
        description: "Solo se permiten archivos de imagen (JPEG, PNG).",
        variant: "destructive",
      });
      return;
    }

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    console.log("Created preview URL:", previewUrl);

    // Set the image to edit
    setImageToEdit(previewUrl);

    // Store original file for later reference (we'll upload the edited version)
    setUploadingFile(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Add handler for saving edited image
  const handleSaveEditedImage = (editedUrl: string) => {
    try {
      console.log("Saving edited image...");

      // Create file from edited image dataURL first
      const blob = dataURLtoBlob(editedUrl);
      const fileName = uploadingFile
        ? uploadingFile.name
        : `edited-image-${Date.now()}.jpg`;
      const file = new File([blob], fileName, {
        type: "image/jpeg",
      });

      // Create an object URL from the blob for preview
      const objectUrl = URL.createObjectURL(blob);
      console.log("Created object URL for preview:", objectUrl);

      if (editingImageIndex !== null) {
        // If editing an existing image
        console.log(`Updating image at index ${editingImageIndex}`);
        const newPreviewUrls = [...mediaPreviewUrls];

        // Clean up old URL
        if (newPreviewUrls[editingImageIndex]) {
          URL.revokeObjectURL(newPreviewUrls[editingImageIndex]);
        }

        // Set the new edited URL
        newPreviewUrls[editingImageIndex] = objectUrl;
        setMediaPreviewUrls(newPreviewUrls);

        // Replace existing file
        const newMediaFiles = [...mediaFiles];
        newMediaFiles[editingImageIndex] = file;
        setMediaFiles(newMediaFiles);
      } else {
        // If adding a new image
        console.log("Adding new image");
        setMediaPreviewUrls((prev) => [...prev, objectUrl]);
        setMediaFiles((prev) => [...prev, file]);
      }

      // Start upload
      console.log("Starting file upload...");
      uploadFile(file)
        .then(() => {
          console.log("File upload completed");
          setUploadingFile(null);
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
          toast({
            title: "Error al subir la imagen",
            description: "No se pudo subir la imagen. Intenta nuevamente.",
            variant: "destructive",
          });
        });

      // Reset editing state
      setImageToEdit(null);
      setEditingImageIndex(null);

      // Log current media previews
      console.log("Current media preview URLs:", mediaPreviewUrls);

      // Force a re-render of the preview after a short delay
      setTimeout(() => {
        console.log("Forcing re-render of media previews");
        setMediaPreviewUrls((prev) => [...prev]);
      }, 100);
    } catch (error) {
      console.error("Error processing edited image:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la imagen.",
        variant: "destructive",
      });

      // Reset editing state even if there's an error
      setImageToEdit(null);
      setEditingImageIndex(null);
    }
  };

  // Add utility function to convert data URL to Blob
  const dataURLtoBlob = (dataURL: string): Blob => {
    try {
      const arr = dataURL.split(",");
      const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch (error) {
      console.error("Error converting dataURL to Blob:", error);
      // Return a small empty blob as fallback
      return new Blob([], { type: "image/jpeg" });
    }
  };

  // Add handler for editing existing image
  const handleEditImage = (index: number) => {
    setImageToEdit(mediaPreviewUrls[index]);
    setEditingImageIndex(index);
  };

  // Add handler for updating YouTube links
  const handleYouTubeLinksChange = (links: string[]) => {
    setFormData((prev) => ({
      ...prev,
      youtubeUrls: links,
      youtubeUrl: links.length > 0 ? links[0] : "", // Keep first link in youtubeUrl for backward compatibility
    }));
  };

  // Remove a media item
  const removeMedia = (index: number) => {
    // Remove from files array
    const newMediaFiles = [...mediaFiles];
    newMediaFiles.splice(index, 1);
    setMediaFiles(newMediaFiles);

    // Remove from preview URLs
    const newPreviewUrls = [...mediaPreviewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]); // Clean up object URL
    newPreviewUrls.splice(index, 1);
    setMediaPreviewUrls(newPreviewUrls);
  };

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      mediaPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleSelectRecipient = async (recipient: string) => {
    try {
      setIsSubmitting(true);

      // Update form data with the selected recipient
      setFormData((prev) => ({
        ...prev,
        recipient,
      }));

      // Create the campaign before showing step 3
      const newCampaignId = await createCampaign({
        ...formData,
        recipient,
        // Include media information
        media: uploadedUrls.map((url, index) => ({
          mediaUrl: url,
          type: "image" as const,
          isPrimary: index === 0,
          orderIndex: index,
        })),
      });

      if (!newCampaignId) {
        toast({
          title: "Error",
          description: "No se pudo crear la campaña. Intenta nuevamente.",
          variant: "destructive",
        });
        return;
      }

      // Move to step 3
      setCurrentStep(3);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al crear la campaña.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the modals for recipient selection
  const handleSelectOtraPersona = () => {
    setShowOtraPersonaModal(true);
  };

  const handleSelectONG = () => {
    setShowONGsModal(true);
  };

  const handleOtraPersonaSubmit = async () => {
    closeOtraPersonaModal();
    await handleSelectRecipient("otra_persona");
  };

  const handleONGSubmit = async () => {
    closeONGsModal();
    await handleSelectRecipient("organizacion");
  };

  return (
    <>
      <style jsx global>{`
        input,
        textarea,
        select,
        .bg-card {
          background-color: white !important;
        }
        input:focus,
        textarea:focus,
        select:focus {
          border-color: #478c5c !important;
          outline: none !important;
        }
      `}</style>

      {/* STEP #1 */}
      {currentStep === 1 && (
        <div className="max-w-6xl mx-auto space-y-24">
          {/* Campaign Name */}
          <div className="py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="pt-4">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Nombre de la campaña
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Dale un nombre claro a tu campaña y agrega una breve
                  explicación o detalle para transmitir rápidamente su esencia y
                  objetivo.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-black p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-medium mb-2">
                      Nombre de la campaña
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ingresa el nombre de tu campaña"
                        className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 h-14 px-4"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        maxLength={80}
                      />
                      <div className="text-sm text-gray-500 text-right mt-1">
                        {formData.title.length}/80
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-medium mb-2">
                      Detalle
                    </label>
                    <div className="relative">
                      <textarea
                        placeholder="Ejemplo: Su conservación depende de nosotros"
                        rows={4}
                        className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 p-4"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        maxLength={150}
                      />
                      <div className="text-sm text-gray-500 text-right mt-1">
                        {formData.description.length}/150
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-16 border-b border-[#478C5C]/20" />
          </div>

          {/* Category */}
          <div className="py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="pt-4">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Selecciona una categoría
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Categoriza una categoría y tu campaña va ser encontrada más
                  fácilmente por los donadores potenciales.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-black p-8">
                <label className="block text-lg font-medium mb-2">
                  Categoría
                </label>
                <select
                  className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 h-14 px-4"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="medioambiente">Medioambiente</option>
                  <option value="educacion">Educación</option>
                  <option value="salud">Salud</option>
                </select>
              </div>
            </div>
            <div className="mt-16 border-b border-[#478C5C]/20" />
          </div>

          {/* Fundraising Goal */}
          <div className="py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="pt-4">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Establece una meta de recaudación
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Define una meta realista que te ayude a alcanzar el objetivo
                  de tu campaña.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-black p-8">
                <div className="space-y-4">
                  <label className="block text-lg font-medium mb-2">
                    Meta de recaudación
                  </label>
                  <input
                    type="number"
                    placeholder="Ingresa el monto a recaudar"
                    className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 h-14 px-4"
                    value={formData.goalAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, goalAmount: e.target.value })
                    }
                  />
                  <div className="flex items-center gap-2 bg-[#EDF2FF] border border-[#365AFF] rounded-lg p-2 mt-4">
                    <Image
                      src="/views/create-campaign/Form/info.svg"
                      alt="Info"
                      width={20}
                      height={20}
                    />
                    <span className="text-base text-gray-600">
                      Este será el monto objetivo de tu campaña
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-16 border-b border-[#478C5C]/20" />
          </div>

          {/* Media Upload */}
          <div className="py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="pt-4">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Agrega fotos y videos que ilustren tu causa
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Imágenes poderosas que cuenten tu historia harán que tu
                  campaña sea más personal y emotiva. Esto ayudará a inspirar y
                  conectar con más personas que apoyen tu causa.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-black p-8">
                <div className="space-y-6">
                  <div
                    className="border-2 border-dashed border-gray-400 rounded-lg p-10 text-center bg-white"
                    onClick={() => fileInputRef.current?.click()}
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
                        Arrastra o carga tus fotos aquí
                      </p>
                      <p className="text-xs text-gray-400 mb-4">
                        Sólo archivos en formato JPEG, PNG y máximo 2 MB
                      </p>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/jpeg,image/png"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                      <Button
                        variant="outline"
                        className="bg-[#2c6e49] text-white hover:bg-[#1e4d33] border-0 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <div className="flex items-center gap-2">
                            <LoadingSpinner size="sm" />
                            <span>Subiendo...</span>
                          </div>
                        ) : (
                          "Seleccionar"
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Show upload progress */}
                  {uploadingFile && (
                    <UploadProgress
                      progress={progress}
                      fileName={uploadingFile.name}
                    />
                  )}

                  {/* Preview uploaded images */}
                  {mediaPreviewUrls.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-3">
                        Imágenes cargadas
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {mediaPreviewUrls.map((url, index) => (
                          <div
                            key={index}
                            className="relative rounded-lg overflow-hidden border border-gray-200"
                          >
                            <Image
                              src={url}
                              alt={`Media ${index + 1}`}
                              width={200}
                              height={150}
                              className="w-full h-32 object-cover"
                            />
                            <div className="absolute top-2 right-2 flex gap-1">
                              <button
                                className="bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditImage(index);
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="text-blue-500"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>
                              <button
                                className="bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeMedia(index);
                                }}
                              >
                                <X size={16} className="text-red-500" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-center my-6">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <div className="px-4 text-gray-500">O</div>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>

                  {/* YouTubeLinks Component */}
                  <YouTubeLinks
                    links={formData.youtubeUrls || []}
                    onChange={handleYouTubeLinksChange}
                  />
                </div>
              </div>
            </div>
            <div className="mt-16 border-b border-[#478C5C]/20" />
          </div>

          {/* Location */}
          <div className="py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="pt-4">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Señala la ubicación de tu campaña
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  ¿Dónde se desarrolla tu campaña? Agrega su ubicación.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-black p-8">
                <label className="block text-lg font-medium mb-2">
                  Ubicación de la campaña
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="¿Adónde irán los fondos?"
                    className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 pl-10 h-14 px-4"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Image
                    src="/views/create-campaign/Form/Base/info.svg"
                    alt="Info"
                    width={16}
                    height={16}
                  />
                  <span className="text-base text-gray-600">
                    Campo opcional
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-16 border-b border-[#478C5C]/20" />
          </div>

          {/* Duration */}
          <div className="py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="pt-4">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Define el tiempo que durará tu campaña
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  ¿Hasta qué fecha deberá estar vigente tu campaña? Establece un
                  tiempo de duración. Toma en cuenta que, una vez publicada tu
                  campaña, no podrás modificar este plazo.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-black p-6">
                <label className="block text-lg font-medium mb-2">
                  Fecha de finalización
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="DD/MM/AAAA"
                    className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 pl-10 h-14 px-4"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="mt-16 border-b border-[#478C5C]/20" />
          </div>

          {/* Campaign Story */}
          <div className="py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="pt-4">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Ahora sí: ¡Cuenta tu historia!
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Inspira a los demás compartiendo el propósito de tu proyecto.
                  Sé claro y directo para que tu causa conecte de manera
                  profunda con quienes pueden hacer la diferencia.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-black p-6">
                <div className="relative">
                  <label className="block text-lg font-medium mb-2">
                    Presentación de la campaña
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Ejemplo: Su conservación depende de nosotros"
                    className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 p-4"
                    value={formData.story}
                    onChange={(e) =>
                      setFormData({ ...formData, story: e.target.value })
                    }
                    maxLength={600}
                  />
                  <div className="text-sm text-gray-500 text-right mt-1">
                    {formData.story.length}/600
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-16 border-b border-[#478C5C]/20" />
          </div>

          {/* Add a "Siguiente" button to jump to step #2 */}
          <div className="flex justify-end mt-8">
            <Button
              className="bg-[#478C5C] text-white"
              onClick={nextStep}
              disabled={isSubmitting || !isStep1Valid}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Procesando...</span>
                </div>
              ) : (
                "Siguiente"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* STEP #2 */}
      {currentStep === 2 && (
        <div className="max-w-6xl mx-auto space-y-24">
          {/* Full-width header for "Destino de los fondos" */}
          <div className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] h-[400px] mt-16">
            <Image
              src="/page-header.svg"
              alt="Page Header"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-[80px] font-bold text-white">
                Destino de los fondos
              </h1>
            </div>
          </div>

          {/* Recipient section */}
          <div className="py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="pt-4">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Cuéntanos quién recibirá lo recaudado
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Selecciona la persona o entidad encargada de recibir los
                  fondos de tu campaña. Esto garantiza que el apoyo llegue a
                  quien más lo necesita.
                </p>
                {/* Display loading state here if submitting */}
                {isSubmitting && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-base text-green-800">
                      Creando tu campaña...
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <label
                  className="block p-6 border-2 border-black rounded-lg hover:border-[#2c6e49] cursor-pointer bg-white"
                  onClick={() => handleSelectRecipient("tu_mismo")}
                >
                  <div className="flex items-center space-x-4">
                    <Image
                      src="/views/create-campaign/yourself.svg"
                      alt="Tú mismo"
                      width={75}
                      height={75}
                    />
                    <div>
                      <div className="font-medium text-lg">Tú mismo</div>
                      <div className="text-base text-gray-600">
                        Recibes los fondos recaudados en tu campaña directamente
                        en tu cuenta bancaria.
                      </div>
                    </div>
                  </div>
                </label>

                <label
                  className="block p-6 border-2 border-black rounded-lg hover:border-[#2c6e49] cursor-pointer bg-white"
                  onClick={handleSelectOtraPersona}
                >
                  <div className="flex items-center space-x-4">
                    <Image
                      src="/views/create-campaign/other-person.svg"
                      alt="Otra persona"
                      width={75}
                      height={75}
                    />
                    <div>
                      <div className="font-medium text-lg">Otra persona</div>
                      <div className="text-base text-gray-600">
                        Designa a la persona que recibirá los fondos recaudados
                        en tu campaña.
                      </div>
                    </div>
                  </div>
                </label>

                <label
                  className="block p-6 border-2 border-black rounded-lg hover:border-[#2c6e49] cursor-pointer bg-white"
                  onClick={handleSelectONG}
                >
                  <div className="flex items-center space-x-4">
                    <Image
                      src="/views/create-campaign/organization.svg"
                      alt="Organización sin fines de lucro"
                      width={75}
                      height={75}
                    />
                    <div>
                      <div className="font-medium text-lg">
                        Organización sin fines de lucro
                      </div>
                      <div className="text-base text-gray-600">
                        Elige la organización, previamente autenticada en Minka,
                        que recibirá los fondos recaudados.
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Just show a back button */}
          <div className="flex justify-start mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
            >
              Volver al paso anterior
            </Button>
          </div>
        </div>
      )}

      {/* STEP #3 */}
      {currentStep === 3 && (
        <div className="max-w-6xl mx-auto space-y-24">
          {/* Preview Section - Full Width */}
          <div className="bg-[#478C5C] w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] pt-8">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex items-start justify-between gap-12 relative">
                <div className="max-w-xl py-8">
                  <h2 className="text-[42px] font-bold text-white">
                    ¡Ya está todo listo!
                  </h2>
                  <h2 className="text-[42px] font-bold text-white mb-4">
                    Revisa cómo quedó
                  </h2>
                  <p className="text-lg text-white/90 mb-6">
                    Antes de publicar tu campaña, verifica que todo esté
                    correcto. Puedes ver cómo lucirá en Minka.
                  </p>
                  <Button
                    variant="outline"
                    className="bg-white text-[#478C5C] border-white hover:bg-white/90 flex items-center gap-2 px-8 py-2 rounded-full"
                  >
                    <span>Vista previa</span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 5.25C4.5 5.25 1.5 12 1.5 12C1.5 12 4.5 18.75 12 18.75C19.5 18.75 22.5 12 22.5 12C22.5 12 19.5 5.25 12 5.25Z"
                        stroke="#478C5C"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92893 14.0711 8.25 12 8.25C9.92893 8.25 8.25 9.92893 8.25 12C8.25 14.0711 9.92893 15.75 12 15.75Z"
                        stroke="#478C5C"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>
                </div>
                <div className="flex-1 flex justify-end items-end">
                  <Image
                    src="/views/create-campaign/all-ready.svg"
                    alt="Campaign Preview"
                    width={502}
                    height={350}
                    className="w-full max-w-[502px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Verification Section */}
          <div className="py-16">
            <div className="container mx-auto px-4">
              <div className="flex items-start justify-between gap-16">
                <div className="max-w-md">
                  <h2 className="text-4xl font-bold mb-4">
                    Verifica tu campaña
                  </h2>
                  <p className="text-lg text-gray-600">
                    La verificación asegura la transparencia de tu campaña, te
                    ayuda a generar confianza en los donantes y a destacar.{" "}
                    <span className="font-bold">
                      ¡Te recomendamos no saltarte este paso!
                    </span>
                  </p>
                </div>
                <div className="flex-1">
                  <div className="bg-white rounded-xl border border-black p-8">
                    <div className="flex justify-center mb-4">
                      <Image
                        src="/views/create-campaign/verified.svg"
                        alt="Verificación"
                        width={64}
                        height={64}
                      />
                    </div>
                    <h3 className="text-xl font-medium mb-2 text-center">
                      Mejora tu campaña
                    </h3>
                    <p className="text-gray-600 mb-6 text-center">
                      Puedes verificar tu campaña para destacarla y generar
                      confianza, o publicarla directamente para empezar a
                      recibir apoyo.
                    </p>
                    <div className="w-full h-px bg-gray-200 my-6"></div>
                    <div className="space-y-3">
                      <Link href="/campaign-verification" className="block">
                        <Button className="w-full bg-[#478C5C] hover:bg-[#3a7049] text-white rounded-full py-4 flex items-center justify-center gap-2">
                          <span>Solicitar verificación</span>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M14 5L21 12M21 12L14 19M21 12H3"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="w-full border-[#478C5C]/20 text-gray-600 rounded-full py-4 flex items-center justify-center gap-1"
                        onClick={handlePublish}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <LoadingSpinner size="sm" />
                            <span>Publicando...</span>
                          </div>
                        ) : (
                          <span>Omitir y publicar</span>
                        )}
                        {!isSubmitting && (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9 6L15 12L9 18"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
            >
              Volver
            </Button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white max-w-xl w-full mx-4 relative shadow-lg">
            <div className="bg-[#f5f7e9] py-3 px-6 flex justify-end relative">
              <button
                onClick={closeSuccessModal}
                className="text-[#478C5C] hover:text-[#2c6e49]"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="mb-6">
                  <Image
                    src="/views/create-campaign/handshake.svg"
                    alt="Éxito"
                    width={70}
                    height={70}
                  />
                </div>
                <h2 className="text-3xl font-bold mb-2">¡Felicidades!</h2>
                <h3 className="text-3xl font-bold mb-4">
                  Tu campaña ya está activa
                </h3>
                <p className="text-gray-600 text-lg">
                  Ahora puedes compartirla para empezar a recibir apoyo.
                </p>
              </div>

              <h4 className="text-xl font-bold mb-4 text-center">Compartir</h4>
              <div className="flex justify-center gap-8 mb-6">
                <button
                  className="flex flex-col items-center"
                  onClick={() => {
                    if (campaignId) {
                      const url = `${window.location.origin}/campaign/${campaignId}`;
                      navigator.clipboard.writeText(url);
                      toast({
                        title: "¡Copiado!",
                        description: "Enlace copiado al portapapeles",
                      });
                    }
                  }}
                >
                  <div className="w-14 h-14 rounded-full border border-gray-300 flex items-center justify-center mb-1">
                    <Image
                      src="/social-media/url.svg"
                      alt="Copiar enlace"
                      width={22}
                      height={22}
                    />
                  </div>
                  <span className="text-sm">Copiar enlace</span>
                </button>

                <a
                  href={
                    campaignId
                      ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/campaign/${campaignId}`)}`
                      : "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 rounded-full border border-gray-300 flex items-center justify-center mb-1">
                    <Image
                      src="/social-media/facebook.svg"
                      alt="Facebook"
                      width={22}
                      height={22}
                    />
                  </div>
                  <span className="text-sm">Facebook</span>
                </a>

                <a
                  href={
                    campaignId
                      ? `https://wa.me/?text=${encodeURIComponent(`¡Apoya mi campaña en Minka! ${window.location.origin}/campaign/${campaignId}`)}`
                      : "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 rounded-full border border-gray-300 flex items-center justify-center mb-1">
                    <Image
                      src="/social-media/whatsapp.svg"
                      alt="WhatsApp"
                      width={22}
                      height={22}
                    />
                  </div>
                  <span className="text-sm">WhatsApp</span>
                </a>

                <a
                  href={
                    campaignId
                      ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(`¡Apoya mi campaña en Minka! ${window.location.origin}/campaign/${campaignId}`)}`
                      : "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center"
                >
                  <div className="w-14 h-14 rounded-full border border-gray-300 flex items-center justify-center mb-1">
                    <Image
                      src="/social-media/X.svg"
                      alt="X"
                      width={22}
                      height={22}
                    />
                  </div>
                  <span className="text-sm">X</span>
                </a>
              </div>
              <div className="border-t border-black my-3"></div>

              <div className="flex justify-center mt-6">
                <Button
                  className="bg-[#478C5C] hover:bg-[#3a7049] text-white rounded-full py-2 px-8"
                  onClick={() => {
                    if (campaignId) {
                      router.push(`/campaign/${campaignId}`);
                    }
                  }}
                >
                  Ver mi campaña
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showOtraPersonaModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white max-w-xl w-full mx-4 relative shadow-lg">
            <div className="bg-[#f5f7e9] py-3 px-6 flex justify-end relative">
              <button
                onClick={closeOtraPersonaModal}
                className="text-[#478C5C] hover:text-[#2c6e49]"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold">
                  Elige al beneficiario de tu campaña
                </h2>
                <p className="text-gray-600 mt-2">
                  Designa a la persona que recibirá los fondos recaudados en tu
                  campaña. Asegúrate de que su información sea correcta para
                  garantizar una entrega segura.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Banco
                  </label>
                  <div className="relative">
                    <select className="flex h-11 w-full rounded-md border border-black bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#478C5C] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm appearance-none">
                      <option value="">Banco Economico</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Número de cuenta
                  </label>
                  <input
                    type="text"
                    placeholder="Ingresa el número de cuenta bancaria"
                    className="flex h-11 w-full rounded-md border border-black bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#478C5C] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Documento de identidad
                  </label>
                  <div className="flex">
                    <div className="flex items-center h-11 px-3 border border-black border-r-0 rounded-l-md bg-white">
                      <div className="flex items-center">
                        <span className="inline-block mr-2">🇧🇴</span>
                        <span>BO</span>
                      </div>
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Ingresa el número de tu DNI"
                      className="flex-1 h-11 rounded-l-none rounded-r-md border border-black bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#478C5C] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nombre del titular de la cuenta
                  </label>
                  <input
                    type="text"
                    placeholder="Ingresa el nombre del beneficiario"
                    className="flex h-11 w-full rounded-md border border-black bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#478C5C] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Teléfono
                  </label>
                  <div className="flex">
                    <div className="flex items-center h-11 px-3 border border-black border-r-0 rounded-l-md bg-white">
                      <div className="flex items-center">
                        <span className="inline-block mr-2">🇧🇴</span>
                        <span>BO</span>
                      </div>
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Número de teléfono"
                      className="flex-1 h-11 rounded-l-none rounded-r-md border border-black bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#478C5C] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  className="bg-[#478C5C] hover:bg-[#3a7049] text-white rounded-full py-2 px-8"
                  onClick={handleOtraPersonaSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    "Continuar"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showONGsModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white max-w-xl w-full mx-4 relative shadow-lg">
            <div className="bg-[#f5f7e9] py-3 px-6 flex justify-end relative">
              <button
                onClick={closeONGsModal}
                className="text-[#478C5C] hover:text-[#2c6e49]"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold">
                  Organizaciones autenticadas en Minka
                </h2>
                <p className="text-gray-600 mt-2">
                  Las siguientes son organizaciones autenticadas y
                  pre-registradas en Minka. Selecciona a cuál de ellas quieres
                  enviar lo recaudado en tu campaña
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Organización sin fines de lucro
                </label>
                <div className="relative">
                  <select className="flex h-11 w-full rounded-md border border-black bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#478C5C] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm appearance-none">
                    <option value="">Selecciona la ONGs</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  className="bg-[#478C5C] hover:bg-[#3a7049] text-white rounded-full py-2 px-8"
                  onClick={handleONGSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    "Continuar"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Editor Modal */}
      {imageToEdit && (
        <ImageEditor
          imageUrl={imageToEdit}
          onSave={handleSaveEditedImage}
          onCancel={() => {
            setImageToEdit(null);
            setEditingImageIndex(null);
          }}
        />
      )}
    </>
  );
}
