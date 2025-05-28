"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Check,
  Clock,
  MapPin,
  Share2,
  Bookmark,
  Calendar,
  ChevronDown,
  Play,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useCampaign, CampaignFormData } from "@/hooks/use-campaign";
import { useUpload } from "@/hooks/use-upload";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { UploadProgress } from "./UploadProgress";
import { ImageEditor } from "./ImageEditor";
import { YouTubeLinks } from "./YouTubeLinks";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import Link from "next/link";

// Campaign Preview component
const CampaignPreview = ({
  campaign,
  onClose,
  uploadedUrls = [],
}: {
  campaign: CampaignFormData & { media?: { mediaUrl: string }[] };
  onClose: () => void;
  uploadedUrls?: string[];
}) => {
  // Format currency helper
  const formatCurrency = (amount: string | number) => {
    if (!amount) return "Bs. 0.00";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `Bs. ${num.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Convert any available media URLs to a consistent format for display
  const mediaUrls: string[] =
    campaign.media?.map((m: { mediaUrl: string }) => m.mediaUrl) ||
    uploadedUrls ||
    [];

  // Prepare images in the format expected by CampaignGallery
  const galleryImages = mediaUrls.map((url: string, index: number) => ({
    url,
    type: url.includes("video") ? ("video" as const) : ("image" as const),
    id: `preview-img-${index}`,
  }));

  // Add a default image if none provided
  if (galleryImages.length === 0) {
    galleryImages.push({
      url: "/landing-page/dummies/Card/Imagen.png",
      type: "image" as const,
      id: "default-img",
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 overflow-y-auto flex items-start justify-center pt-8">
      <div className="bg-[#fbfbf6] max-w-6xl w-full relative rounded-lg shadow-xl overflow-y-auto max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md z-10"
        >
          <X className="h-5 w-5 text-gray-700" />
        </button>

        <div className="p-4 sm:p-6 md:p-8">
          <h2 className="text-xl font-medium text-[#2c6e49] mb-4">
            Vista previa
          </h2>

          {/* Campaign Header & Gallery - Grid layout from the campaign/[id] page */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-4 text-[#333333]">
                {campaign.title ||
                  "Protejamos juntos el parque Nacional Amboró"}
              </h1>

              {/* Gallery Section */}
              <div className="space-y-4">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-gray-200">
                  <Image
                    src={galleryImages[0].url}
                    alt={`${campaign.title} - Imagen principal`}
                    fill
                    className="object-cover"
                  />
                  {/* Verification badge */}
                  <div className="absolute bottom-3 right-3 bg-white rounded-full p-1.5 shadow-md">
                    <Check className="h-5 w-5 text-[#2c6e49]" />
                  </div>
                </div>

                {galleryImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 sm:gap-3">
                    {galleryImages.slice(0, 4).map((image, index) => (
                      <div
                        key={image.id}
                        className={`relative aspect-[16/9] overflow-hidden rounded-lg border-2 ${
                          index === 0
                            ? "border-[#2c6e49]"
                            : "border-transparent"
                        }`}
                      >
                        <Image
                          src={image.url}
                          alt={`${campaign.title} - Imagen ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        {image.type === "video" && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="bg-white/80 rounded-full p-1">
                              <Play className="h-5 w-5 text-[#2c6e49]" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Campaign Details Section - Similar to the campaign/[id] page */}
              <div className="mt-8 space-y-6">
                {/* Organizer Header */}
                <div className="flex items-center gap-3 py-4 border-b border-gray-200">
                  <div className="h-10 w-10 rounded-full bg-[#e8f0e9] flex items-center justify-center">
                    <span className="text-sm font-medium text-[#2c6e49]">
                      A
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-[#2c6e49]">
                      Andrés Martínez Saucedo
                    </h3>
                    <p className="text-sm text-gray-600">
                      Gestor de campaña | Santa Cruz de la Sierra, Bolivia
                    </p>
                  </div>
                </div>

                {/* Verification Badge */}
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/landing-page/step-2.png"
                      alt="Verified"
                      width={28}
                      height={28}
                      className="text-[#2c6e49]"
                    />
                    <span className="text-[#2c6e49] text-lg font-medium">
                      Campaña verificada por Minka
                    </span>
                  </div>
                  <a href="#" className="text-[#2c6e49] underline text-sm">
                    Más información
                  </a>
                </div>

                {/* Campaign Description */}
                <div className="space-y-3 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-[#2c6e49]">
                    Descripción de la campaña
                  </h2>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {campaign.description ||
                      "El Parque Nacional Amboró es uno de los lugares más biodiversos del mundo, hogar de especies únicas y ecosistemas vitales. Su conservación depende de todos nosotros."}
                  </p>
                </div>

                {/* Campaign Story */}
                <div className="space-y-3 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-[#2c6e49]">
                    Presentación de la campaña
                  </h2>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {campaign.story ||
                      "El Parque Nacional Amboró es un tesoro natural incomparable, reconocido como uno de los lugares más biodiversos del planeta. En sus exuberantes paisajes, alberga especies únicas de flora y fauna que dependen de este ecosistema para sobrevivir..."}
                  </p>
                </div>

                {/* Beneficiaries */}
                {campaign.beneficiariesDescription && (
                  <div className="space-y-3 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-[#2c6e49]">
                      Beneficiarios
                    </h2>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {campaign.beneficiariesDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Campaign Progress */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-[#2c6e49] mb-1">
                  Avances de la campaña
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Cada aporte cuenta. ¡Sé parte del cambio!
                </p>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-[#2c6e49]" />
                    <span className="text-sm">Campaña verificada</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">Creada hace 6 días</span>
                  </div>
                </div>

                {/* Separator */}
                <hr className="h-px w-full bg-gray-200 my-4" />

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Recaudado Bs. 1.200,00</span>
                    <span>250 donadores</span>
                  </div>
                  <div className="h-2 w-full bg-[#e8f0e9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2c6e49] rounded-full"
                      style={{ width: "80%" }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#2c6e49]">80%</span>
                    <span>
                      Objetivo: {formatCurrency(campaign.goalAmount || 4000)}
                    </span>
                  </div>
                </div>

                {/* Separator */}
                <hr className="h-px w-full bg-gray-200 my-4" />

                <div className="space-y-3">
                  <Button className="w-full bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full py-4">
                    Donar ahora
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-200 hover:bg-gray-50 rounded-full py-4"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Compartir
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full hover:bg-gray-50 rounded-full py-4"
                  >
                    <Bookmark className="mr-2 h-4 w-4" />
                    Guardar campaña
                  </Button>
                </div>
              </div>

              {/* Campaign Updates */}
              <div className="mt-6 bg-white p-5 rounded-lg border border-gray-200">
                <h2 className="text-lg font-medium text-[#2c6e49] mb-4">
                  Anuncios de la campaña
                </h2>
                <p className="text-gray-600 text-sm">
                  Aún no hay anuncios en esta campaña. Los anuncios se mostrarán
                  aquí cuando el organizador los publique.
                </p>
              </div>

              {/* Comments */}
              <div className="mt-6 bg-white p-5 rounded-lg border border-gray-200">
                <h2 className="text-lg font-medium text-[#2c6e49] mb-4">
                  Comentarios de donadores
                </h2>
                <p className="text-gray-600 text-sm">
                  Aún no hay comentarios en esta campaña. Los donadores podrán
                  dejar sus comentarios aquí.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Update the form sections (showing only the modified parts)
export function CampaignForm() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    isCreating,
    campaignId,
    createCampaign,
    saveCampaignDraft,
    updateCampaign,
  } = useCampaign();
  const {
    isUploading,
    progress,
    uploadedUrls,
    setUploadedUrls,
    uploadFile,
    uploadFiles,
  } = useUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format currency helper
  const formatCurrency = (amount: string | number) => {
    if (!amount) return "Bs. 0.00";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `Bs. ${num.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const [currentStep, setCurrentStep] = useState(1);
  // Add new state for animation
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<"next" | "prev">(
    "next"
  );
  const [formData, setFormData] = useState<CampaignFormData>({
    title: "",
    description: "",
    category: "",
    goalAmount: "",
    location: "la_paz", // Set default value to La Paz
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

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Add this new state for preview
  const [showPreview, setShowPreview] = useState(false);

  // Add state for verification redirect
  const [redirectToVerification, setRedirectToVerification] = useState(false);

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

  const handleSelectRecipient = async (recipient: string) => {
    try {
      setIsSubmitting(true);

      // Update form data with the selected recipient
      setFormData((prev) => ({
        ...prev,
        recipient,
      }));

      // If we already have a campaignId, update it instead of creating a new one
      if (campaignId) {
        const success = await updateCampaign({ recipient }, campaignId);

        if (!success) {
          throw new Error("Failed to update campaign recipient");
        }

        // Move to step 3 after successful selection and update with animation
        setAnimationDirection("next");
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentStep(3);
          window.scrollTo(0, 0);
          // Reset animation state after a short delay
          setTimeout(() => {
            setIsAnimating(false);
          }, 50);
        }, 500);
      } else {
        // This should not happen if the workflow is correct, but just in case
        toast({
          title: "Error",
          description: "No se encontró la campaña. Intenta nuevamente.",
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      console.error("Error handling recipient selection:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la selección.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsSubmitting(true);

      if (!campaignId) {
        toast({
          title: "Error",
          description: "No se encontró la campaña a publicar.",
          variant: "destructive",
        });
        return;
      }

      // Update campaign status to active but keep verificationStatus as false
      const success = await updateCampaign(
        {
          campaignStatus: "active",
          verificationStatus: false,
        },
        campaignId
      );

      if (!success) {
        throw new Error("Failed to update campaign status");
      }

      setShowSuccessModal(true);
      router.push("/dashboard/campaigns");
    } catch (error) {
      console.error("Error publishing campaign:", error);
      toast({
        title: "Error",
        description: "Error al publicar la campaña",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // New function to handle verification request
  const handleRequestVerification = async () => {
    try {
      if (!campaignId) {
        toast({
          title: "Error",
          description: "No se encontró la campaña para verificar.",
          variant: "destructive",
        });
        return;
      }

      // First, publish the campaign if not already published
      const publishSuccess = await updateCampaign(
        {
          campaignStatus: "active",
        },
        campaignId
      );

      if (!publishSuccess) {
        throw new Error("Failed to publish campaign");
      }

      // Store the campaign ID in local storage so CampaignVerificationView can use it
      localStorage.setItem("verificationCampaignId", campaignId);

      // Set redirect flag to true
      setRedirectToVerification(true);

      // Redirect to verification page with campaign ID in the URL query parameter
      router.push(`/campaign-verification?id=${campaignId}`);
    } catch (error) {
      console.error("Error preparing for verification:", error);
      toast({
        title: "Error",
        description: "Error al preparar la campaña para verificación",
        variant: "destructive",
      });
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

  // Utility function to help with image URL issues
  const ensureMediaIsUploaded = async (): Promise<boolean> => {
    // If uploadedUrls is empty but we have mediaFiles, try to upload them now
    if (uploadedUrls.length === 0 && mediaFiles.length > 0) {
      console.log(
        "Fixing media URLs - uploadedUrls is empty but we have mediaFiles"
      );
      try {
        // Upload the files
        const urls = await uploadFiles(mediaFiles);
        if (urls.length > 0) {
          console.log("Successfully uploaded media files:", urls);
          return true;
        } else {
          console.error("Failed to upload media files");
          return false;
        }
      } catch (error) {
        console.error("Error uploading media files:", error);
        return false;
      }
    }

    // If we already have uploaded URLs, we're good
    return uploadedUrls.length > 0;
  };

  // Update the nextStep function to include animations
  const nextStep = async () => {
    if (currentStep === 1) {
      if (!validateForm()) {
        // Show toast for validation errors
        toast({
          title: "Campos incompletos",
          description:
            "Por favor completa todos los campos requeridos marcados en rojo.",
          variant: "destructive",
        });
        // Scroll to the first error
        const firstErrorKey = Object.keys(formErrors)[0];
        if (firstErrorKey) {
          const element = document.getElementById(firstErrorKey);
          if (element)
            element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
      }

      // Validate that we have uploaded URLs
      if (!uploadedUrls.length) {
        console.log(
          "No uploaded URLs but we have media files - attempting to fix"
        );

        // Try to ensure media is uploaded
        setIsSubmitting(true);
        const mediaUploadFixed = await ensureMediaIsUploaded();

        if (!mediaUploadFixed) {
          console.error("Could not fix media upload issue");
          toast({
            title: "Error de imágenes",
            description:
              "Las imágenes no se han subido correctamente. Por favor, vuelve a intentarlo.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        console.log(
          "Media upload fixed, proceeding with uploaded URLs:",
          uploadedUrls
        );
      }

      try {
        setIsSubmitting(true);
        // Create or update draft campaign before proceeding to step 2
        const draftData = {
          ...formData,
          // Convert goalAmount to number by removing separators
          goalAmount: removeNumberSeparators(String(formData.goalAmount)),
          // Include media information
          media: uploadedUrls.map((url, index) => ({
            mediaUrl: url,
            type: "image" as const,
            isPrimary: index === 0,
            orderIndex: index,
          })),
        };

        console.log("Saving draft with data:", {
          formFields: Object.keys(formData),
          goalAmount: draftData.goalAmount,
          goalAmountType: typeof draftData.goalAmount,
          mediaCount: uploadedUrls.length,
          firstMediaUrl: uploadedUrls[0],
        });

        // Save the draft and get campaign ID
        const newCampaignId = await saveCampaignDraft(draftData);

        if (!newCampaignId) {
          console.error(
            "Failed to create or update campaign draft - no ID returned"
          );
          toast({
            title: "Error",
            description:
              "No se pudo crear el borrador de la campaña. Intenta nuevamente.",
            variant: "destructive",
          });
          return;
        }

        console.log("Campaign draft saved with ID:", newCampaignId);

        // Start fade out animation before changing step
        setAnimationDirection("next");
        setIsAnimating(true);
        setTimeout(() => {
          // Proceed to next step
          setCurrentStep(currentStep + 1);
          window.scrollTo(0, 0);
          // Reset animation state after a short delay
          setTimeout(() => {
            setIsAnimating(false);
          }, 50);
        }, 500); // Wait for fade out animation to complete
      } catch (error) {
        console.error("Error saving draft:", error);
        toast({
          title: "Error al guardar borrador",
          description:
            error instanceof Error
              ? error.message
              : "Ocurrió un error al guardar el borrador.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (currentStep === 2) {
      try {
        setIsSubmitting(true);

        // Save beneficiaries description
        if (campaignId) {
          const success = await updateCampaign(
            {
              beneficiariesDescription: formData.beneficiariesDescription,
            },
            campaignId
          );

          if (!success) {
            throw new Error("Failed to update beneficiaries description");
          }
        }

        // Start fade out animation before changing step
        setAnimationDirection("next");
        setIsAnimating(true);
        setTimeout(() => {
          // Move to step 3
          setCurrentStep(3);
          window.scrollTo(0, 0);
          // Reset animation state after a short delay
          setTimeout(() => {
            setIsAnimating(false);
          }, 50);
        }, 500); // Wait for fade out animation to complete
      } catch (error) {
        console.error("Error saving beneficiaries description:", error);
        toast({
          title: "Error",
          description:
            "Ocurrió un error al guardar la descripción de los beneficiarios.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // General case for other steps
    setAnimationDirection("next");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
      // Reset animation state after a short delay
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 500);
  };

  // Update the prevStep function to include animations
  const prevStep = () => {
    setAnimationDirection("prev");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
      // Reset animation state after a short delay
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 500);
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
  const handleSaveEditedImage = async (editedUrl: string) => {
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
      const result = await uploadFile(file);
      console.log("Upload result:", result);

      if (!result.success) {
        throw new Error("Failed to upload file");
      }

      console.log("File upload completed, uploaded URLs now:", uploadedUrls);
      setUploadingFile(null);

      // Reset editing state
      setImageToEdit(null);
      setEditingImageIndex(null);

      // Show success toast
      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente.",
      });
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

    // Remove from uploaded URLs
    const newUploadedUrls = [...uploadedUrls];
    newUploadedUrls.splice(index, 1);
    setUploadedUrls(newUploadedUrls);
  };

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      mediaPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

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

  // Add validation function to check all required fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate title
    if (!formData.title || formData.title.length < 3) {
      errors.title = "El título debe tener al menos 3 caracteres";
    }

    // Validate description
    if (!formData.description || formData.description.length < 10) {
      errors.description = "La descripción debe tener al menos 10 caracteres";
    }

    // Validate category
    if (!formData.category) {
      errors.category = "Debes seleccionar una categoría";
    }

    // Validate story
    if (!formData.story || formData.story.length < 10) {
      errors.story =
        "La presentación de la campaña debe tener al menos 10 caracteres";
    }

    // Validate at least one image and ensure it's been uploaded properly
    if (mediaPreviewUrls.length === 0 || uploadedUrls.length === 0) {
      errors.media = "Debes subir al menos una imagen";
    }

    // Log validation information
    console.log("Form validation:", {
      mediaPreviewUrls: mediaPreviewUrls.length,
      uploadedUrls: uploadedUrls.length,
      errors,
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add function to format number with thousands separators
  const formatNumberWithSeparators = (value: string | number): string => {
    // Convert to string and remove any non-digit characters first
    const stringValue = String(value || "");
    const numericValue = stringValue.replace(/\D/g, "");

    // Return empty string if no digits
    if (!numericValue) return "";

    // Add thousands separators (dots)
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Add function to remove separators and get raw numeric value
  const removeNumberSeparators = (value: string): string => {
    return value.replace(/\./g, "");
  };

  // Add function to handle input change with number validation
  const handleGoalAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Only allow digits and dots (for existing separators)
    const numericOnly = inputValue.replace(/[^\d.]/g, "");

    // Remove existing separators to get raw value
    const rawValue = removeNumberSeparators(numericOnly);

    // Update form data with raw numeric value
    setFormData({ ...formData, goalAmount: rawValue });

    // Clear error if value is provided
    if (rawValue) {
      setFormErrors({ ...formErrors, goalAmount: "" });
    }
  };

  // Add style block for transitions at the beginning of the component return statement
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
        select:focus,
        [data-state="open"] > .ui-select-trigger {
          border-color: #478c5c !important;
          outline: none !important;
        }
        .error-input {
          border-color: #e11d48 !important;
        }
        .error-text {
          color: #e11d48;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        /* Custom select styling */
        [data-radix-select-trigger] {
          height: 56px !important;
          border-radius: 0.5rem !important;
          border-width: 1px !important;
          font-size: 1rem !important;
        }

        [data-radix-select-content] {
          background-color: white !important;
          border-color: #e5e7eb !important;
          border-radius: 0.5rem !important;
          box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }

        [data-radix-select-item] {
          font-size: 1rem !important;
          padding: 0.5rem 1rem !important;
        }

        [data-radix-select-item][data-highlighted] {
          background-color: #f0f7f1 !important;
          color: #2c6e49 !important;
        }

        /* Animation styles */
        .form-step {
          opacity: 1;
          transition: opacity 0.5s ease-in-out;
        }

        .form-step.fade-out {
          opacity: 0;
        }

        .form-step.fade-in {
          opacity: 1;
        }

        /* Modal animations */
        .modal-overlay {
          opacity: 0;
          transition: opacity 0.3s ease-in-out;
        }

        .modal-overlay.visible {
          opacity: 1;
        }

        .modal-content {
          transform: translateY(20px);
          opacity: 0;
          transition: all 0.4s ease-in-out;
        }

        .modal-content.visible {
          transform: translateY(0);
          opacity: 1;
        }
      `}</style>

      {/* STEP #1 */}
      {currentStep === 1 && (
        <div
          className={`form-step ${isAnimating ? (animationDirection === "next" ? "fade-out" : "fade-in") : ""} max-w-6xl mx-auto space-y-16 md:space-y-24 px-4 sm:px-6 md:px-0`}
        >
          {/* Campaign Name */}
          <div className="py-6 md:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              <div className="pt-0 md:pt-4">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
                  Nombre de la campaña
                </h2>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  Dale un nombre claro a tu campaña y agrega una breve
                  explicación o detalle para transmitir rápidamente su esencia y
                  objetivo.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-black p-6 md:p-8">
                <div className="space-y-6">
                  <div id="title">
                    <label className="block text-lg font-medium mb-2">
                      Nombre de la campaña
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ingresa el nombre de tu campaña"
                        className={`w-full rounded-lg border ${formErrors.title ? "error-input" : "border-black"} bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 h-14 px-4`}
                        value={formData.title}
                        onChange={(e) => {
                          setFormData({ ...formData, title: e.target.value });
                          if (e.target.value.length >= 3) {
                            setFormErrors({ ...formErrors, title: "" });
                          }
                        }}
                        maxLength={80}
                      />
                      <div className="text-sm text-gray-500 text-right mt-1">
                        {formData.title.length}/80
                      </div>
                      {formErrors.title && (
                        <div className="error-text">{formErrors.title}</div>
                      )}
                    </div>
                  </div>

                  <div id="description">
                    <label className="block text-lg font-medium mb-2">
                      Detalle
                    </label>
                    <div className="relative">
                      <textarea
                        placeholder="Ejemplo: Su conservación depende de nosotros"
                        rows={4}
                        className={`w-full rounded-lg border ${formErrors.description ? "error-input" : "border-black"} bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 p-4`}
                        value={formData.description}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          });
                          if (e.target.value.length >= 10) {
                            setFormErrors({ ...formErrors, description: "" });
                          }
                        }}
                        maxLength={150}
                      />
                      <div className="text-sm text-gray-500 text-right mt-1">
                        {formData.description.length}/150
                      </div>
                      {formErrors.description && (
                        <div className="error-text">
                          {formErrors.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 md:mt-16 border-b border-[#478C5C]/20" />
          </div>

          {/* Category */}
          <div className="py-6 md:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              <div className="pt-0 md:pt-4">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
                  Selecciona una categoría
                </h2>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  Categoriza una categoría y tu campaña va ser encontrada más
                  fácilmente por los donadores potenciales.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-black p-6 md:p-8">
                <label className="block text-lg font-medium mb-2" id="category">
                  Categoría
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => {
                    setFormData({ ...formData, category: value });
                    if (value) {
                      setFormErrors({ ...formErrors, category: "" });
                    }
                  }}
                >
                  <SelectTrigger
                    className={`ui-select-trigger w-full rounded-lg border ${formErrors.category ? "error-input" : "border-black"} bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 h-14 px-4 text-base`}
                  >
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectGroup>
                      <SelectItem value="cultura_arte">
                        Cultura y arte
                      </SelectItem>
                      <SelectItem value="educacion">Educación</SelectItem>
                      <SelectItem value="emergencia">Emergencias</SelectItem>
                      <SelectItem value="igualdad">Igualdad</SelectItem>
                      <SelectItem value="medioambiente">
                        Medioambiente
                      </SelectItem>
                      <SelectItem value="salud">Salud</SelectItem>
                      <SelectItem value="otros">Otros</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <div className="error-text">{formErrors.category}</div>
                )}
              </div>
            </div>
            <div className="mt-8 md:mt-16 border-b border-[#478C5C]/20" />
          </div>

          {/* Fundraising Goal */}
          <div className="py-6 md:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              <div className="pt-0 md:pt-4">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
                  Establece una meta de recaudación
                </h2>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  Define una meta realista que te ayude a alcanzar el objetivo
                  de tu campaña.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-black p-6 md:p-8">
                <div className="space-y-4">
                  <label
                    className="block text-lg font-medium mb-2"
                    id="goalAmount"
                  >
                    Meta de recaudación
                  </label>
                  <input
                    type="text"
                    placeholder="Ingresa el monto a recaudar"
                    className={`w-full rounded-lg border ${formErrors.goalAmount ? "error-input" : "border-black"} bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 h-14 px-4`}
                    value={formatNumberWithSeparators(formData.goalAmount)}
                    onChange={handleGoalAmountChange}
                  />
                  {formErrors.goalAmount && (
                    <div className="error-text">{formErrors.goalAmount}</div>
                  )}
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
            <div className="mt-8 md:mt-16 border-b border-[#478C5C]/20" />
          </div>

          {/* Media Upload */}
          <div className="py-6 md:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              <div className="pt-0 md:pt-4">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
                  Agrega fotos y videos que ilustren tu causa
                </h2>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  Imágenes poderosas que cuenten tu historia harán que tu
                  campaña sea más personal y emotiva. Esto ayudará a inspirar y
                  conectar con más personas que apoyen tu causa.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-black p-6 md:p-8">
                <div className="space-y-6" id="media">
                  <div
                    className={`border-2 border-dashed ${formErrors.media ? "border-red-500" : "border-gray-400"} rounded-lg p-10 text-center bg-white`}
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
                            <InlineSpinner className="text-white" />
                            <span>Subiendo...</span>
                          </div>
                        ) : (
                          "Seleccionar"
                        )}
                      </Button>
                    </div>
                  </div>
                  {formErrors.media && (
                    <div className="error-text">{formErrors.media}</div>
                  )}

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
                            className={`relative rounded-lg overflow-hidden border ${index === 0 ? "border-[#2c6e49] ring-2 ring-[#2c6e49]" : "border-gray-200"}`}
                          >
                            <Image
                              src={url}
                              alt={`Media ${index + 1}`}
                              width={200}
                              height={150}
                              className="w-full h-32 object-cover"
                            />
                            {index === 0 && (
                              <div className="absolute top-2 left-2 bg-[#2c6e49] text-white text-xs px-2 py-1 rounded-full">
                                Imagen principal
                              </div>
                            )}
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
            <div className="mt-8 md:mt-16 border-b border-[#478C5C]/20" />
          </div>

          {/* Location */}
          <div className="py-6 md:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              <div className="pt-0 md:pt-4">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
                  Señala la ubicación de tu campaña
                </h2>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  ¿Dónde se desarrolla tu campaña? Agrega su ubicación.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-black p-6 md:p-8">
                <label className="block text-lg font-medium mb-2">
                  Ubicación de la campaña
                </label>
                <div className="relative">
                  <Select
                    value={formData.location}
                    onValueChange={(value) =>
                      setFormData({ ...formData, location: value as any })
                    }
                  >
                    <SelectTrigger className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 h-14 px-4">
                      <div className="flex items-center w-full">
                        <MapPin className="h-5 w-5 mr-2 text-gray-400 shrink-0" />
                        <SelectValue
                          placeholder="Selecciona una ubicación"
                          className="text-sm md:text-base"
                        />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectGroup>
                        <SelectItem
                          value="la_paz"
                          className="text-sm md:text-base py-2"
                        >
                          La Paz
                        </SelectItem>
                        <SelectItem
                          value="santa_cruz"
                          className="text-sm md:text-base py-2"
                        >
                          Santa Cruz
                        </SelectItem>
                        <SelectItem
                          value="cochabamba"
                          className="text-sm md:text-base py-2"
                        >
                          Cochabamba
                        </SelectItem>
                        <SelectItem
                          value="sucre"
                          className="text-sm md:text-base py-2"
                        >
                          Sucre
                        </SelectItem>
                        <SelectItem
                          value="oruro"
                          className="text-sm md:text-base py-2"
                        >
                          Oruro
                        </SelectItem>
                        <SelectItem
                          value="potosi"
                          className="text-sm md:text-base py-2"
                        >
                          Potosí
                        </SelectItem>
                        <SelectItem
                          value="tarija"
                          className="text-sm md:text-base py-2"
                        >
                          Tarija
                        </SelectItem>
                        <SelectItem
                          value="beni"
                          className="text-sm md:text-base py-2"
                        >
                          Beni
                        </SelectItem>
                        <SelectItem
                          value="pando"
                          className="text-sm md:text-base py-2"
                        >
                          Pando
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Image
                    src="/views/create-campaign/Form/Base/info.svg"
                    alt="Info"
                    width={16}
                    height={16}
                  />
                  <span className="text-base text-gray-600">
                    Campo requerido
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-8 md:mt-16 border-b border-[#478C5C]/20" />
          </div>

          {/* Duration - REPLACED WITH DATE PICKER */}
          <div className="py-6 md:py-12" id="endDate">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              <div className="pt-0 md:pt-4">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
                  Define el tiempo que durará tu campaña
                </h2>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  ¿Hasta qué fecha deberá estar vigente tu campaña? Establece un
                  tiempo de duración. Toma en cuenta que, una vez publicada tu
                  campaña, no podrás modificar este plazo.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-black p-6 md:p-8">
                <label className="block text-lg font-medium mb-2">
                  Fecha de finalización
                </label>
                <div className="relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="DD/MM/AAAA"
                          className={`w-full rounded-lg border ${formErrors.endDate ? "error-input" : "border-black"} bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 pl-10 h-14 px-4 cursor-pointer`}
                          value={formData.endDate ? formData.endDate : ""}
                          readOnly
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={
                          formData.endDate
                            ? new Date(formData.endDate)
                            : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            const formattedDate = format(date, "yyyy-MM-dd");
                            setFormData({
                              ...formData,
                              endDate: formattedDate,
                            });
                            setFormErrors({ ...formErrors, endDate: "" });
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {formErrors.endDate && (
                    <div className="error-text">{formErrors.endDate}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-8 md:mt-16 border-b border-[#478C5C]/20" />
          </div>

          {/* Campaign Story */}
          <div className="py-6 md:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
              <div className="pt-0 md:pt-4">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
                  Ahora sí: ¡Cuenta tu historia!
                </h2>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  Inspira a los demás compartiendo el propósito de tu proyecto.
                  Sé claro y directo para que tu causa conecte de manera
                  profunda con quienes pueden hacer la diferencia.
                </p>
              </div>
              <div className="bg-white rounded-xl border border-black p-6 md:p-8">
                <div className="relative" id="story">
                  <label className="block text-lg font-medium mb-2">
                    Presentación de la campaña (historia)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Ejemplo: Su conservación depende de nosotros"
                    className={`w-full rounded-lg border ${formErrors.story ? "error-input" : "border-black"} bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 p-4`}
                    value={formData.story}
                    onChange={(e) => {
                      setFormData({ ...formData, story: e.target.value });
                      if (e.target.value.length >= 10) {
                        setFormErrors({ ...formErrors, story: "" });
                      }
                    }}
                    maxLength={600}
                  />
                  <div className="text-sm text-gray-500 text-right mt-1">
                    {formData.story.length}/600
                  </div>
                  {formErrors.story && (
                    <div className="error-text">{formErrors.story}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-8 md:mt-16 border-b border-[#478C5C]/20" />
          </div>

          {/* Submit Buttons */}
          <div className="py-6 md:py-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto rounded-full bg-white text-[#2c6e49] border-[#2c6e49] hover:bg-[#f0f7f1] px-8"
                onClick={async () => {
                  try {
                    setIsSubmitting(true);
                    // Validate form and save as draft
                    if (!validateForm()) {
                      // Scroll to the first error
                      const firstError = Object.keys(formErrors)[0];
                      const errorElement = document.getElementById(firstError);
                      if (errorElement) {
                        errorElement.scrollIntoView({
                          behavior: "smooth",
                          block: "center",
                        });
                      }
                      return;
                    }

                    // Process media if not already done
                    const mediaUploaded = await ensureMediaIsUploaded();
                    if (!mediaUploaded) {
                      return;
                    }

                    // Prepare data for API
                    const apiData = {
                      ...formData,
                      // Convert goalAmount to number by removing separators
                      goalAmount: removeNumberSeparators(
                        String(formData.goalAmount)
                      ),
                      mediaUrls: uploadedUrls,
                      youtubeUrls: formData.youtubeUrls || [],
                    };

                    // Save as draft and go to next step
                    const success = await saveCampaignDraft(apiData);
                    if (success) {
                      setCurrentStep(2);
                      window.scrollTo(0, 0);
                    }
                  } catch (error) {
                    console.error("Error saving draft:", error);
                    toast({
                      title: "Error",
                      description: "Error al guardar el borrador",
                      variant: "destructive",
                    });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting || !isStep1Valid}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <InlineSpinner className="text-[#2c6e49]" />
                    <span>Guardando...</span>
                  </div>
                ) : (
                  "Guardar como borrador"
                )}
              </Button>
              <Button
                className="w-full sm:w-auto rounded-full bg-[#2c6e49] hover:bg-[#1e4d33] px-8"
                onClick={nextStep}
                disabled={isSubmitting || !isStep1Valid}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <InlineSpinner className="text-white" />
                    <span>Guardando...</span>
                  </div>
                ) : (
                  "Continuar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* STEP #2 */}
      {currentStep === 2 && (
        <div
          className={`form-step ${isAnimating ? (animationDirection === "next" ? "fade-out" : "fade-in") : ""} max-w-6xl mx-auto space-y-24`}
        >
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
                    <InlineSpinner className="text-green-800" />
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
                      alt="Tú mismo/a"
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
        <div
          className={`form-step ${isAnimating ? (animationDirection === "prev" ? "fade-out" : "fade-in") : ""} max-w-6xl mx-auto space-y-24`}
        >
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
                    onClick={() => setShowPreview(true)}
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
                      <Button
                        onClick={handleRequestVerification}
                        className="w-full bg-[#478C5C] hover:bg-[#3a7049] text-white rounded-full py-4 flex items-center justify-center gap-2"
                        disabled={isSubmitting}
                      >
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
                      <Button
                        onClick={handlePublish}
                        className="w-full border border-[#478C5C] text-[#478C5C] hover:bg-[#f0f7f1] rounded-full py-4"
                        variant="outline"
                        disabled={isSubmitting}
                      >
                        Publicar sin verificar
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
        <div className="modal-overlay visible fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="modal-content visible bg-white max-w-xl w-full mx-4 relative shadow-lg">
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
        <div className="modal-overlay visible fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="modal-content visible bg-white max-w-xl w-full mx-4 max-h-[90vh] relative shadow-lg flex flex-col">
            <div className="bg-[#f5f7e9] py-3 px-6 flex justify-end relative sticky top-0 z-10">
              <button
                onClick={closeOtraPersonaModal}
                className="text-[#478C5C] hover:text-[#2c6e49]"
                aria-label="Cerrar"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
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
            </div>

            <div className="flex justify-center p-4 bg-white border-t border-gray-200 sticky bottom-0 z-10">
              <Button
                className="bg-[#478C5C] hover:bg-[#3a7049] text-white rounded-full py-2 px-8"
                onClick={handleOtraPersonaSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <InlineSpinner className="text-white" />
                    <span>Procesando...</span>
                  </div>
                ) : (
                  "Continuar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showONGsModal && (
        <div className="modal-overlay visible fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="modal-content visible bg-white max-w-xl w-full mx-4 max-h-[90vh] relative shadow-lg flex flex-col">
            <div className="bg-[#f5f7e9] py-3 px-6 flex justify-end relative sticky top-0 z-10">
              <button
                onClick={closeONGsModal}
                className="text-[#478C5C] hover:text-[#2c6e49]"
                aria-label="Cerrar"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
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

              <div className="flex justify-center p-4 bg-white border-t border-gray-200 sticky bottom-0 z-10">
                <Button
                  className="bg-[#478C5C] hover:bg-[#3a7049] text-white rounded-full py-2 px-8"
                  onClick={handleONGSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <InlineSpinner className="text-white" />
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

      {/* Image Editor Modal - Updated to show loading indicator */}
      {imageToEdit && (
        <div className="modal-overlay visible">
          <ImageEditor
            imageUrl={imageToEdit}
            onSave={handleSaveEditedImage}
            onCancel={() => {
              setImageToEdit(null);
              setEditingImageIndex(null);
            }}
            isLoading={isUploading}
          />
        </div>
      )}

      {/* Campaign Preview Modal */}
      {showPreview && (
        <div
          className={`modal-overlay visible fixed inset-0 bg-black/40 z-50 overflow-y-auto flex items-start justify-center pt-8`}
        >
          <div
            className={`modal-content visible bg-[#fbfbf6] max-w-6xl w-full relative rounded-lg shadow-xl overflow-y-auto max-h-[90vh]`}
          >
            {/* Close button */}
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md z-10"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>

            <div className="p-4 sm:p-6 md:p-8">
              <h2 className="text-xl font-medium text-[#2c6e49] mb-4">
                Vista previa
              </h2>

              {/* Campaign Header & Gallery - Grid layout from the campaign/[id] page */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <h1 className="text-2xl md:text-3xl font-bold mb-4 text-[#333333]">
                    {formData.title ||
                      "Protejamos juntos el parque Nacional Amboró"}
                  </h1>

                  {/* Gallery Section */}
                  <div className="space-y-4">
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-gray-200">
                      <Image
                        src={
                          mediaPreviewUrls[0] ||
                          "/landing-page/dummies/Card/Imagen.png"
                        }
                        alt={`${formData.title} - Imagen principal`}
                        fill
                        className="object-cover"
                      />
                      {/* Verification badge */}
                      <div className="absolute bottom-3 right-3 bg-white rounded-full p-1.5 shadow-md">
                        <Check className="h-5 w-5 text-[#2c6e49]" />
                      </div>
                    </div>

                    {mediaPreviewUrls.length > 1 && (
                      <div className="grid grid-cols-4 gap-2 sm:gap-3">
                        {mediaPreviewUrls.slice(0, 4).map((url, index) => (
                          <div
                            key={index}
                            className={`relative aspect-[16/9] overflow-hidden rounded-lg border-2 ${
                              index === 0
                                ? "border-[#2c6e49]"
                                : "border-transparent"
                            }`}
                          >
                            <Image
                              src={url}
                              alt={`${formData.title} - Imagen ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            {index === 0 && (
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <div className="bg-white/80 rounded-full p-1">
                                  <Play className="h-5 w-5 text-[#2c6e49]" />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Campaign Details Section - Similar to the campaign/[id] page */}
                  <div className="mt-8 space-y-6">
                    {/* Organizer Header */}
                    <div className="flex items-center gap-3 py-4 border-b border-gray-200">
                      <div className="h-10 w-10 rounded-full bg-[#e8f0e9] flex items-center justify-center">
                        <span className="text-sm font-medium text-[#2c6e49]">
                          A
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-[#2c6e49]">
                          Andrés Martínez Saucedo
                        </h3>
                        <p className="text-sm text-gray-600">
                          Gestor de campaña | Santa Cruz de la Sierra, Bolivia
                        </p>
                      </div>
                    </div>

                    {/* Verification Badge */}
                    <div className="flex items-center justify-between py-4 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <Image
                          src="/landing-page/step-2.png"
                          alt="Verified"
                          width={28}
                          height={28}
                          className="text-[#2c6e49]"
                        />
                        <span className="text-[#2c6e49] text-lg font-medium">
                          Campaña verificada por Minka
                        </span>
                      </div>
                      <a href="#" className="text-[#2c6e49] underline text-sm">
                        Más información
                      </a>
                    </div>

                    {/* Campaign Description */}
                    <div className="space-y-3 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-[#2c6e49]">
                        Descripción de la campaña
                      </h2>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {formData.description ||
                          "El Parque Nacional Amboró es uno de los lugares más biodiversos del mundo, hogar de especies únicas y ecosistemas vitales. Su conservación depende de todos nosotros."}
                      </p>
                    </div>

                    {/* Campaign Story */}
                    <div className="space-y-3 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-[#2c6e49]">
                        Presentación de la campaña
                      </h2>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {formData.story ||
                          "El Parque Nacional Amboró es un tesoro natural incomparable, reconocido como uno de los lugares más biodiversos del planeta. En sus exuberantes paisajes, alberga especies únicas de flora y fauna que dependen de este ecosistema para sobrevivir..."}
                      </p>
                    </div>

                    {/* Beneficiaries */}
                    {formData.beneficiariesDescription && (
                      <div className="space-y-3 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-[#2c6e49]">
                          Beneficiarios
                        </h2>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {formData.beneficiariesDescription}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Campaign Progress */}
                <div className="lg:col-span-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-[#2c6e49] mb-1">
                      Avances de la campaña
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Cada aporte cuenta. ¡Sé parte del cambio!
                    </p>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <Check className="h-4 w-4 text-[#2c6e49]" />
                        <span className="text-sm">Campaña verificada</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">Creada hace 6 días</span>
                      </div>
                    </div>

                    {/* Separator */}
                    <hr className="h-px w-full bg-gray-200 my-4" />

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Recaudado Bs. 1.200,00</span>
                        <span>250 donadores</span>
                      </div>
                      <div className="h-2 w-full bg-[#e8f0e9] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2c6e49] rounded-full"
                          style={{ width: "80%" }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#2c6e49]">80%</span>
                        <span>
                          Objetivo:{" "}
                          {formatCurrency(formData.goalAmount || 4000)}
                        </span>
                      </div>
                    </div>

                    {/* Separator */}
                    <hr className="h-px w-full bg-gray-200 my-4" />

                    <div className="space-y-3">
                      <Button className="w-full bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full py-4">
                        Donar ahora
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-gray-200 hover:bg-gray-50 rounded-full py-4"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Compartir
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full hover:bg-gray-50 rounded-full py-4"
                      >
                        <Bookmark className="mr-2 h-4 w-4" />
                        Guardar campaña
                      </Button>
                    </div>
                  </div>

                  {/* Campaign Updates */}
                  <div className="mt-6 bg-white p-5 rounded-lg border border-gray-200">
                    <h2 className="text-lg font-medium text-[#2c6e49] mb-4">
                      Anuncios de la campaña
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Aún no hay anuncios en esta campaña. Los anuncios se
                      mostrarán aquí cuando el organizador los publique.
                    </p>
                  </div>

                  {/* Comments */}
                  <div className="mt-6 bg-white p-5 rounded-lg border border-gray-200">
                    <h2 className="text-lg font-medium text-[#2c6e49] mb-4">
                      Comentarios de donadores
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Aún no hay comentarios en esta campaña. Los donadores
                      podrán dejar sus comentarios aquí.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
