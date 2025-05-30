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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CountryCodeSelector } from "@/components/ui/country-code-selector";
import { findCountryByCode } from "@/data/country-codes";
import {
  formatPhoneNumber,
  validatePhoneNumber,
  getPhonePlaceholder,
} from "@/utils/phone-formatter";

// Define interface for Campaign
interface Campaign {
  id: string;
  title: string;
  image_url: string;
  verification_status: string | null;
  status: string;
}

// Define props for the component
interface CampaignVerificationViewProps {
  campaignId?: string;
}

export function CampaignVerificationView({
  campaignId: initialCampaignId,
}: CampaignVerificationViewProps = {}) {
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

  // State for campaigns that can be verified
  const [unverifiedCampaigns, setUnverifiedCampaigns] = useState<Campaign[]>(
    []
  );
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState<boolean>(false);

  // State for campaign that is being verified
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    initialCampaignId || null
  );
  const [campaignTitle, setCampaignTitle] = useState<string>("");

  // Flag to indicate if we should redirect to campaign ID URL
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false);

  // Add state for verification steps
  const [verificationStep, setVerificationStep] = useState(1);
  // Add animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<"next" | "prev">(
    "next"
  );

  // Form states
  const [idDocumentFrontFile, setIdDocumentFrontFile] = useState<File | null>(
    null
  );
  const [idDocumentFrontUrl, setIdDocumentFrontUrl] = useState<string | null>(
    null
  );
  const [idDocumentBackFile, setIdDocumentBackFile] = useState<File | null>(
    null
  );
  const [idDocumentBackUrl, setIdDocumentBackUrl] = useState<string | null>(
    null
  );
  const [supportingDocs, setSupportingDocs] = useState<File[]>([]);
  const [supportingDocsUrls, setSupportingDocsUrls] = useState<string[]>([]);
  const [campaignStory, setCampaignStory] = useState<string>("");
  const [referenceContact, setReferenceContact] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "BO", // Default to Bolivia
  });

  // Add state for image queue
  const [pendingImageQueue, setPendingImageQueue] = useState<File[]>([]);

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
  const [isSupportingDocEditing, setIsSupportingDocEditing] = useState(false);
  const [editingIdDocumentSide, setEditingIdDocumentSide] = useState<
    "front" | "back" | null
  >(null);
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

  // Add a new state for verification status right after all the other state declarations
  const [verificationStatusInfo, setVerificationStatusInfo] = useState<{
    status: "pending" | "approved" | "rejected" | null;
    requestDate: string | null;
    approvalDate: string | null;
    notes: string | null;
  }>({
    status: null,
    requestDate: null,
    approvalDate: null,
    notes: null,
  });
  const [isLoadingVerificationStatus, setIsLoadingVerificationStatus] =
    useState(false);

  // Get campaign ID from props or fetch unverified campaigns on mount
  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        // First try to get campaign ID from props
        if (initialCampaignId) {
          console.log(
            "Loading campaign from initialCampaignId:",
            initialCampaignId
          );
          await loadCampaignById(initialCampaignId);
        } else {
          // If not in props, check localStorage as fallback
          const storedCampaignId = localStorage.getItem(
            "verificationCampaignId"
          );
          if (storedCampaignId) {
            console.log(
              "Loading campaign from localStorage:",
              storedCampaignId
            );
            await loadCampaignById(storedCampaignId);
            // Clear from localStorage after using it to prevent stale data in future visits
            localStorage.removeItem("verificationCampaignId");
          } else {
            // Otherwise, fetch all unverified campaigns for selection
            console.log(
              "No campaign ID found, fetching all unverified campaigns"
            );
            await fetchUnverifiedCampaigns();
          }
        }
      } catch (error) {
        console.error("Error initializing campaign verification:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información de las campañas.",
          variant: "destructive",
        });
      }
    };

    fetchCampaignData();
  }, [initialCampaignId]);

  // Redirect to campaign-specific URL if a campaign is selected from dropdown
  useEffect(() => {
    if (shouldRedirect && selectedCampaignId) {
      router.push(`/campaign-verification/${selectedCampaignId}`);
      setShouldRedirect(false);
    }
  }, [shouldRedirect, selectedCampaignId, router]);

  // Function to fetch all unverified campaigns for the user
  const fetchUnverifiedCampaigns = async () => {
    setIsLoadingCampaigns(true);
    try {
      const response = await fetch("/api/campaign/unverified", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch campaigns");
      }

      const data = await response.json();

      if (data.campaigns && Array.isArray(data.campaigns)) {
        setUnverifiedCampaigns(data.campaigns);

        // If there's no campaign ID provided and we have campaigns,
        // preselect the first one
        if (!initialCampaignId && data.campaigns.length > 0) {
          setSelectedCampaignId(data.campaigns[0].id);
          setCampaignTitle(data.campaigns[0].title);
        } else if (data.campaigns.length === 0) {
          toast({
            title: "Sin campañas para verificar",
            description: "No tienes campañas activas sin verificar.",
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching unverified campaigns:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar tus campañas.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCampaigns(false);
    }
  };

  // Function to load a specific campaign by ID
  const loadCampaignById = async (id: string) => {
    console.log(`Attempting to load campaign with ID: ${id}`);
    try {
      // First check if the ID is valid
      if (!id || id.trim() === "") {
        console.error("Invalid campaign ID provided:", id);
        toast({
          title: "Error",
          description: "ID de campaña inválido.",
          variant: "destructive",
        });
        return;
      }

      console.log(`Fetching campaign details for ID: ${id}`);
      const response = await fetch(`/api/campaign/details?id=${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      console.log(`API response status: ${response.status}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error response:", errorData);
        throw new Error(
          errorData.error || `Failed to fetch campaign: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Campaign data received:", data);

      if (data.campaign) {
        setSelectedCampaignId(data.campaign.id);
        setCampaignTitle(data.campaign.title);
        console.log(`Campaign loaded successfully: ${data.campaign.title}`);

        // Check verification status after setting the campaign
        await checkVerificationStatus(data.campaign.id);
      } else {
        console.error("Campaign data not found in response:", data);
        throw new Error("Campaign data not found");
      }
    } catch (error) {
      console.error("Error loading campaign by ID:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la campaña seleccionada.",
        variant: "destructive",
      });

      // If loading specific campaign fails, redirect to campaign listing
      router.push("/dashboard/campaigns");
    }
  };

  // Function to handle campaign selection from dropdown
  const handleCampaignChange = (campaignId: string) => {
    const campaign = unverifiedCampaigns.find((c) => c.id === campaignId);
    if (campaign) {
      setSelectedCampaignId(campaignId);
      setCampaignTitle(campaign.title);

      // Check verification status before redirecting
      checkVerificationStatus(campaignId);

      setShouldRedirect(true);
    }
  };

  // Start verification process - move to step 2
  const startVerification = () => {
    if (!selectedCampaignId) {
      toast({
        title: "Error",
        description: "No se encontró la campaña para verificar.",
        variant: "destructive",
      });
      return;
    }

    // Don't proceed if there's already a pending verification
    if (verificationStatusInfo.status === "pending") {
      toast({
        title: "Verificación en progreso",
        description:
          "Esta campaña ya tiene una solicitud de verificación pendiente.",
        variant: "default",
      });
      return;
    }

    // If verification was already approved, don't proceed
    if (verificationStatusInfo.status === "approved") {
      toast({
        title: "Campaña verificada",
        description: "Esta campaña ya ha sido verificada exitosamente.",
        variant: "default",
      });
      return;
    }

    // Start animation
    setAnimationDirection("next");
    setIsAnimating(true);

    // After animation fade-out completes, change step and reset animation
    setTimeout(() => {
      setVerificationStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Reset animation state after step change
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 500);
  };

  // Add the getImageType function back
  const getImageType = (file: File): "image" | "document" => {
    return file.type.startsWith("image/") ? "image" : "document";
  };

  // Update handleIdDocumentUpload to handle front and back sides
  const handleIdDocumentUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    side: "front" | "back"
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
        setEditingIdDocumentSide(side);
        setIsIdDocumentEditing(true);
      } else {
        // For non-image files (like PDFs), upload directly
        if (side === "front") {
          setIdDocumentFrontFile(file);
        } else {
          setIdDocumentBackFile(file);
        }

        // Upload ID document using the hook
        const result = await hookUploadFile(file, (p) => setProgress(p));
        if (result.success) {
          if (side === "front") {
            setIdDocumentFrontUrl(result.url);
          } else {
            setIdDocumentBackUrl(result.url);
          }

          toast({
            title: "Documento subido",
            description: `El ${side === "front" ? "anverso" : "reverso"} del documento se ha subido correctamente.`,
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

      // Create a File object from the Blob with appropriate name
      const side = editingIdDocumentSide;
      const fileName =
        side === "front" ? "id-document-front.jpg" : "id-document-back.jpg";
      const file = new File([blob], fileName, { type: "image/jpeg" });

      // Set the file in state and upload it
      if (side === "front") {
        setIdDocumentFrontFile(file);
      } else {
        setIdDocumentBackFile(file);
      }

      setCurrentUploadingFile(file);
      setProgress(0);

      const result = await hookUploadFile(file, (p) => setProgress(p));

      if (result.success) {
        if (side === "front") {
          setIdDocumentFrontUrl(result.url);
        } else {
          setIdDocumentBackUrl(result.url);
        }

        toast({
          title: "Imagen guardada",
          description: `El ${side === "front" ? "anverso" : "reverso"} de la identificación se ha guardado correctamente.`,
        });
      } else {
        throw new Error("No se pudo subir la imagen editada");
      }

      // Close the editor
      setIsIdDocumentEditing(false);
      setEditingImageUrl(null);
      setEditingImageType(null);
      setEditingIdDocumentSide(null);
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
    setEditingIdDocumentSide(null);
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

    // FIXED: Only add non-image files to state immediately
    // Image files will be added after editing
    if (nonImageFiles.length > 0) {
      setSupportingDocs((prev) => [...prev, ...nonImageFiles]);
    }

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

    // If there are images, add them to the queue and process the first one
    if (imageFiles.length > 0) {
      // Add all images to the queue
      setPendingImageQueue((prev) => [...prev, ...imageFiles]);

      // If we're not already editing an image, start processing the first one
      if (!isImageEditorOpen && !isIdDocumentEditing) {
        processNextImageInQueue();
      }
    }

    // Reset the input
    event.target.value = "";
  };

  // New function to process the next image in the queue
  const processNextImageInQueue = () => {
    setPendingImageQueue((prev) => {
      // Get the first image from the queue
      const [nextImage, ...remainingImages] = prev;

      if (nextImage) {
        // Process this image
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setEditingImageType("support");
            setEditingImageUrl(e.target.result as string);
            setIsSupportingDocEditing(true);
          }
        };
        reader.readAsDataURL(nextImage);
      }

      // Return the remaining images
      return remainingImages;
    });
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

      // Add the file to supporting docs
      setSupportingDocs((prev) => [...prev, file]);

      // Start upload process
      setCurrentUploadingFile(file);
      setProgress(0);
      setIsSubmitting(true);

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
      setIsSupportingDocEditing(false);
      setEditingImageType(null);

      // Check if there are more images in the queue
      if (pendingImageQueue.length > 0) {
        // Process the next image
        setTimeout(processNextImageInQueue, 300);
      }
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
      setIsSubmitting(false);
    }
  };

  // Update cancel handlers for supporting doc edits
  const handleCancelSupportingDocEdit = () => {
    setEditingImageIndex(null);
    setEditingImageUrl(null);
    setIsSupportingDocEditing(false);
    setEditingImageType(null);

    // Check if there are more images in the queue
    if (pendingImageQueue.length > 0) {
      // Process the next image
      setTimeout(processNextImageInQueue, 300);
    }
  };

  const removeSupportingDoc = (index: number) => {
    setSupportingDocs((prev) => prev.filter((_, i) => i !== index));
    setSupportingDocsUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Update submit verification request to include both front and back URLs
  const handleSubmitVerification = async () => {
    if (!selectedCampaignId) {
      toast({
        title: "Error",
        description: "No se encontró la campaña para verificar.",
        variant: "destructive",
      });
      return;
    }

    // Check if both sides of ID are uploaded
    if (!idDocumentFrontUrl || !idDocumentBackUrl) {
      toast({
        title: "Documentos incompletos",
        description:
          "Por favor, sube ambos lados de tu documento de identidad.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Get country info for phone formatting
      const selectedCountry = findCountryByCode(referenceContact.countryCode);

      // Format phone number with country code if phone is provided
      let formattedPhone = undefined;
      if (referenceContact.phone) {
        const cleanPhone = referenceContact.phone.replace(/\D/g, "");
        formattedPhone = `${selectedCountry?.dialCode}${cleanPhone}`;
      }

      const verificationData = {
        campaignId: selectedCampaignId,
        idDocumentFrontUrl,
        idDocumentBackUrl,
        supportingDocsUrls,
        campaignStory: campaignStory || undefined,
        referenceContactName: referenceContact.name || undefined,
        referenceContactEmail: referenceContact.email || undefined,
        referenceContactPhone: formattedPhone,
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

      // Show the success modal directly
      setShowSubmitModal(true);
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

    if (selectedCampaignId) {
      router.push(`/campaign/${selectedCampaignId}`);
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

  // Add a function to check the verification status of a campaign
  const checkVerificationStatus = async (campaignId: string) => {
    if (!campaignId) return;

    setIsLoadingVerificationStatus(true);
    try {
      const response = await fetch(
        `/api/campaign/verification/status?campaignId=${campaignId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check verification status");
      }

      const data = await response.json();

      setVerificationStatusInfo({
        status: data.status,
        requestDate: data.requestDate,
        approvalDate: data.approvalDate,
        notes: data.notes,
      });

      // If there's already a pending verification, show a message
      if (data.status === "pending") {
        toast({
          title: "Verificación en progreso",
          description:
            "Esta campaña ya tiene una solicitud de verificación pendiente.",
          variant: "default",
        });
      } else if (data.status === "approved") {
        toast({
          title: "Campaña verificada",
          description: "Esta campaña ya ha sido verificada exitosamente.",
          variant: "default",
        });
      } else if (data.status === "rejected") {
        toast({
          title: "Verificación rechazada",
          description: `La verificación de esta campaña fue rechazada. ${data.notes ? `Motivo: ${data.notes}` : ""}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
      // Don't show error toast, just log it - no verification is a valid state
    } finally {
      setIsLoadingVerificationStatus(false);
    }
  };

  return (
    <div className="w-full pb-20">
      {/* Add style block for animations */}
      <style jsx global>{`
        /* Animation styles */
        .verification-step {
          opacity: 1;
          transition: opacity 0.5s ease-in-out;
        }

        .verification-step.fade-out {
          opacity: 0;
        }

        .verification-step.fade-in {
          opacity: 1;
        }
      `}</style>

      {/* Campaign Info Banner - Always displayed outside steps */}
      <div className="max-w-6xl mx-auto">
        <div className="py-8">
          <div className="bg-[#f5f7e9] p-6 rounded-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-medium text-[#478C5C]">
                  Campaña a verificar
                </h3>
                {isLoadingCampaigns ? (
                  <div className="flex items-center gap-2 mt-2">
                    <InlineSpinner className="text-[#478C5C]" />
                    <p className="text-lg">Cargando campañas...</p>
                  </div>
                ) : selectedCampaignId ? (
                  <p className="text-lg font-bold">{campaignTitle}</p>
                ) : (
                  <p className="text-lg text-gray-500">
                    Selecciona una campaña para verificar
                  </p>
                )}
              </div>

              {!initialCampaignId && unverifiedCampaigns.length > 0 ? (
                <div className="w-full sm:w-auto">
                  <Select
                    value={selectedCampaignId || ""}
                    onValueChange={handleCampaignChange}
                  >
                    <SelectTrigger className="w-full sm:w-[250px]">
                      <SelectValue placeholder="Selecciona una campaña" />
                    </SelectTrigger>
                    <SelectContent>
                      {unverifiedCampaigns.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="border-[#478C5C] text-[#478C5C]"
                  onClick={() => router.push("/dashboard/campaigns")}
                >
                  {initialCampaignId ? "Cambiar campaña" : "Ver mis campañas"}
                </Button>
              )}
            </div>

            {/* Display a message if no campaigns to verify */}
            {!isLoadingCampaigns &&
              unverifiedCampaigns.length === 0 &&
              !selectedCampaignId && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800">
                    No tienes campañas activas sin verificar. Puedes crear una
                    nueva campaña o ir a tu dashboard para ver tus campañas
                    existentes.
                  </p>
                  <div className="mt-3 flex gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#478C5C] text-[#478C5C]"
                      onClick={() => router.push("/create-campaign")}
                    >
                      <Plus className="mr-1 h-4 w-4" /> Nueva campaña
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#478C5C] text-[#478C5C]"
                      onClick={() => router.push("/dashboard/campaigns")}
                    >
                      Ver mis campañas
                    </Button>
                  </div>
                </div>
              )}

            {/* Display verification status info if available */}
            {selectedCampaignId && verificationStatusInfo.status && (
              <div
                className={`mt-4 p-3 rounded-lg border ${
                  verificationStatusInfo.status === "pending"
                    ? "bg-blue-50 border-blue-200"
                    : verificationStatusInfo.status === "approved"
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {verificationStatusInfo.status === "pending" && (
                    <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  )}
                  {verificationStatusInfo.status === "approved" && (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  )}
                  {verificationStatusInfo.status === "rejected" && (
                    <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}

                  <div>
                    <p
                      className={`font-medium ${
                        verificationStatusInfo.status === "pending"
                          ? "text-blue-800"
                          : verificationStatusInfo.status === "approved"
                            ? "text-green-800"
                            : "text-red-800"
                      }`}
                    >
                      {verificationStatusInfo.status === "pending" &&
                        "Verificación en progreso"}
                      {verificationStatusInfo.status === "approved" &&
                        "Campaña verificada"}
                      {verificationStatusInfo.status === "rejected" &&
                        "Verificación rechazada"}
                    </p>

                    <p
                      className={`mt-1 ${
                        verificationStatusInfo.status === "pending"
                          ? "text-blue-700"
                          : verificationStatusInfo.status === "approved"
                            ? "text-green-700"
                            : "text-red-700"
                      }`}
                    >
                      {verificationStatusInfo.status === "pending" &&
                        `Solicitud enviada el ${
                          verificationStatusInfo.requestDate
                            ? new Date(
                                verificationStatusInfo.requestDate
                              ).toLocaleDateString("es-BO")
                            : "fecha desconocida"
                        }. Estamos revisando tu solicitud.`}
                      {verificationStatusInfo.status === "approved" &&
                        `Verificación aprobada el ${
                          verificationStatusInfo.approvalDate
                            ? new Date(
                                verificationStatusInfo.approvalDate
                              ).toLocaleDateString("es-BO")
                            : "fecha desconocida"
                        }.`}
                      {verificationStatusInfo.status === "rejected" &&
                        `Motivo del rechazo: ${verificationStatusInfo.notes || "No especificado"}`}
                    </p>

                    {verificationStatusInfo.status === "rejected" && (
                      <div className="mt-3">
                        <Button
                          onClick={startVerification}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Enviar nueva solicitud
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verification Introduction - Step 1 */}
      {verificationStep === 1 && (
        <div
          className={`verification-step max-w-6xl mx-auto ${isAnimating ? (animationDirection === "next" ? "fade-out" : "fade-in") : ""}`}
        >
          {/* Benefits Section */}
          {selectedCampaignId && (
            <div className="py-12">
              <div className="text-center mb-8">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Beneficios
                </h2>
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
                          Los donadores se sienten más seguros al apoyar
                          campañas verificadas.
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

                  {/* Start verification button - disabled if already pending or approved */}
                  <div className="flex justify-center mt-10">
                    <Button
                      onClick={startVerification}
                      className="bg-[#478C5C] hover:bg-[#3a7049] text-white px-8 py-3 rounded-full text-lg"
                      disabled={
                        isLoadingVerificationStatus ||
                        verificationStatusInfo.status === "pending" ||
                        verificationStatusInfo.status === "approved"
                      }
                    >
                      {isLoadingVerificationStatus ? (
                        <>
                          <InlineSpinner className="mr-2" /> Verificando
                          estado...
                        </>
                      ) : verificationStatusInfo.status === "pending" ? (
                        "Verificación en curso"
                      ) : verificationStatusInfo.status === "approved" ? (
                        "Campaña ya verificada"
                      ) : (
                        "Iniciar verificación"
                      )}
                    </Button>
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

          {/* Steps Section */}
          <div className="py-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Pasos a seguir
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Verificar tu campaña es muy sencillo, solo debes seguir unos
                pocos pasos.
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
                  <h3 className="text-base font-medium">
                    Iniciar verificación
                  </h3>
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
                  <h3 className="text-base font-medium">
                    Cargar documentación
                  </h3>
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
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Requisitos
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Para verificar tu campaña, necesitarás tener a mano los
                siguientes documentos.
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
                        La verificación toma entre 1 y 2 días. La campaña
                        seguirá visible mientras se verifica.
                      </p>
                    </div>
                  </div>
                  <div className="border-b border-gray-300 mt-4"></div>
                </div>

                {/* Start verification button - disabled if already pending or approved */}
                <div className="flex justify-center mt-10">
                  <Button
                    onClick={startVerification}
                    className="bg-[#478C5C] hover:bg-[#3a7049] text-white px-8 py-3 rounded-full text-lg"
                    disabled={
                      isLoadingVerificationStatus ||
                      verificationStatusInfo.status === "pending" ||
                      verificationStatusInfo.status === "approved"
                    }
                  >
                    {isLoadingVerificationStatus ? (
                      <>
                        <InlineSpinner className="mr-2" /> Verificando estado...
                      </>
                    ) : verificationStatusInfo.status === "pending" ? (
                      "Verificación en curso"
                    ) : verificationStatusInfo.status === "approved" ? (
                      "Campaña ya verificada"
                    ) : (
                      "Iniciar verificación"
                    )}
                  </Button>
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

          {/* FAQ Section */}
          <div className="py-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Preguntas frecuentes
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Respondemos las consultas más comunes sobre el proceso de
                verificación.
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
        </div>
      )}

      {/* Verification Form Section - Step 2 */}
      {verificationStep === 2 && (
        <div
          className={`verification-step max-w-6xl mx-auto ${isAnimating ? (animationDirection === "next" ? "fade-out" : "fade-in") : ""}`}
        >
          <div className="py-12">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-8">
              <div>
                <h3 className="text-2xl font-medium mb-4">
                  Documento de Identidad
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed mb-2">
                  Adjunta la foto del anverso y reverso de tu Documento de
                  Identidad para validar tu información personal como
                  responsable de la campaña.
                </p>
                <p className="text-md text-gray-500 italic">
                  Asegúrate de que ambos lados sean legibles y que todos los
                  datos sean visibles.
                </p>
              </div>

              <div className="space-y-8">
                {/* Anverso (Front) Upload */}
                <div className="bg-white rounded-xl border border-black p-6">
                  <h4 className="font-medium text-lg mb-4">
                    Anverso de la Identificación
                  </h4>

                  {idDocumentFrontFile ? (
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-700 font-medium">
                          Anverso del documento
                        </span>
                        <div className="flex gap-2">
                          {getImageType(idDocumentFrontFile) === "image" && (
                            <button
                              onClick={() => {
                                const objectUrl =
                                  URL.createObjectURL(idDocumentFrontFile);
                                setEditingImageUrl(objectUrl);
                                setEditingIdDocumentSide("front");
                                setIsIdDocumentEditing(true);
                              }}
                              className="bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100"
                              title="Editar imagen"
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
                          )}
                          <button
                            onClick={() => setIdDocumentFrontFile(null)}
                            className="bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100"
                            title="Eliminar documento"
                          >
                            <X size={16} className="text-red-500" />
                          </button>
                        </div>
                      </div>

                      {getImageType(idDocumentFrontFile) === "image" ? (
                        <div className="relative rounded-lg overflow-hidden border border-gray-200 mb-3">
                          <Image
                            src={URL.createObjectURL(idDocumentFrontFile)}
                            alt="Anverso del documento"
                            width={300}
                            height={200}
                            className="w-full h-48 object-contain bg-gray-100"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3">
                          <FileText size={24} className="text-gray-500" />
                          <span className="text-sm text-gray-800 truncate">
                            {idDocumentFrontFile.name}
                          </span>
                        </div>
                      )}

                      <div className="bg-green-50 border border-green-200 rounded p-2 flex items-center text-green-700">
                        <CheckCircle2 size={16} className="mr-2" />
                        <span className="text-sm">
                          Anverso cargado correctamente
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center bg-white"
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

                          handleIdDocumentUpload(event, "front");
                        }
                      }}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Image
                          src="/icons/add_ad.svg"
                          alt="Add front ID"
                          width={42}
                          height={42}
                          className="mb-4"
                        />
                        <p className="text-sm text-gray-500 mb-2">
                          Arrastra o carga el anverso de tu CI aquí
                        </p>
                        <p className="text-xs text-gray-400 mb-4">
                          Archivos JPG, PNG, PDF (máx. 10 MB)
                        </p>
                        <div>
                          <input
                            id="id-document-front-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleIdDocumentUpload(e, "front")}
                            className="hidden"
                          />
                          <Button
                            onClick={() =>
                              document
                                .getElementById("id-document-front-upload")
                                ?.click()
                            }
                            className="bg-[#2c6e49] hover:bg-[#235539] text-white rounded-full cursor-pointer"
                            type="button"
                            disabled={isSubmitting}
                          >
                            {isSubmitting &&
                            currentUploadingFile === idDocumentFrontFile ? (
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

                  {/* Progress indicator for front side */}
                  {currentUploadingFile &&
                    currentUploadingFile === idDocumentFrontFile && (
                      <div className="mt-4">
                        <UploadProgress
                          progress={progress}
                          fileName={currentUploadingFile.name}
                        />
                      </div>
                    )}
                </div>

                {/* Reverso (Back) Upload */}
                <div className="bg-white rounded-xl border border-black p-6">
                  <h4 className="font-medium text-lg mb-4">
                    Reverso de la Identificación
                  </h4>

                  {idDocumentBackFile ? (
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-700 font-medium">
                          Reverso del documento
                        </span>
                        <div className="flex gap-2">
                          {getImageType(idDocumentBackFile) === "image" && (
                            <button
                              onClick={() => {
                                const objectUrl =
                                  URL.createObjectURL(idDocumentBackFile);
                                setEditingImageUrl(objectUrl);
                                setEditingIdDocumentSide("back");
                                setIsIdDocumentEditing(true);
                              }}
                              className="bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100"
                              title="Editar imagen"
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
                          )}
                          <button
                            onClick={() => setIdDocumentBackFile(null)}
                            className="bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100"
                            title="Eliminar documento"
                          >
                            <X size={16} className="text-red-500" />
                          </button>
                        </div>
                      </div>

                      {getImageType(idDocumentBackFile) === "image" ? (
                        <div className="relative rounded-lg overflow-hidden border border-gray-200 mb-3">
                          <Image
                            src={URL.createObjectURL(idDocumentBackFile)}
                            alt="Reverso del documento"
                            width={300}
                            height={200}
                            className="w-full h-48 object-contain bg-gray-100"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3">
                          <FileText size={24} className="text-gray-500" />
                          <span className="text-sm text-gray-800 truncate">
                            {idDocumentBackFile.name}
                          </span>
                        </div>
                      )}

                      <div className="bg-green-50 border border-green-200 rounded p-2 flex items-center text-green-700">
                        <CheckCircle2 size={16} className="mr-2" />
                        <span className="text-sm">
                          Reverso cargado correctamente
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center bg-white"
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

                          handleIdDocumentUpload(event, "back");
                        }
                      }}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Image
                          src="/icons/add_ad.svg"
                          alt="Add back ID"
                          width={42}
                          height={42}
                          className="mb-4"
                        />
                        <p className="text-sm text-gray-500 mb-2">
                          Arrastra o carga el reverso de tu CI aquí
                        </p>
                        <p className="text-xs text-gray-400 mb-4">
                          Archivos JPG, PNG, PDF (máx. 10 MB)
                        </p>
                        <div>
                          <input
                            id="id-document-back-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleIdDocumentUpload(e, "back")}
                            className="hidden"
                          />
                          <Button
                            onClick={() =>
                              document
                                .getElementById("id-document-back-upload")
                                ?.click()
                            }
                            className="bg-[#2c6e49] hover:bg-[#235539] text-white rounded-full cursor-pointer"
                            type="button"
                            disabled={isSubmitting}
                          >
                            {isSubmitting &&
                            currentUploadingFile === idDocumentBackFile ? (
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

                  {/* Progress indicator for back side */}
                  {currentUploadingFile &&
                    currentUploadingFile === idDocumentBackFile && (
                      <div className="mt-4">
                        <UploadProgress
                          progress={progress}
                          fileName={currentUploadingFile.name}
                        />
                      </div>
                    )}
                </div>
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
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">
                      Documentos cargados
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {supportingDocs.map((doc, index) => (
                        <div
                          key={index}
                          className="relative rounded-lg overflow-hidden border border-gray-200"
                        >
                          {getImageType(doc) === "image" ? (
                            <>
                              <div className="relative aspect-[4/3] w-full overflow-hidden">
                                <Image
                                  src={URL.createObjectURL(doc)}
                                  alt={`Documento ${index + 1}`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="p-2 bg-white">
                                <p className="text-sm font-medium truncate">
                                  {doc.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {Math.round(doc.size / 1024)} KB
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-3 bg-white p-3">
                              <div className="flex-shrink-0">
                                <FileText size={24} className="text-blue-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">
                                  {doc.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {Math.round(doc.size / 1024)} KB
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="absolute top-2 right-2 flex gap-1">
                            {getImageType(doc) === "image" && (
                              <button
                                onClick={() => {
                                  const objectUrl = URL.createObjectURL(doc);
                                  setEditingImageUrl(objectUrl);
                                  setEditingImageIndex(index);
                                  setIsSupportingDocEditing(true);
                                }}
                                className="bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100"
                                title="Editar imagen"
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
                            )}
                            <button
                              onClick={() => removeSupportingDoc(index)}
                              className="bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100"
                              title="Eliminar documento"
                            >
                              <X size={16} className="text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
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

            {/* Final submission - Step 2 */}
            <div className="mt-12 max-w-3xl mx-auto">
              <div className="bg-white rounded-xl border border-black p-8">
                <div className="flex flex-col items-center text-center">
                  <p className="font-medium text-xl mb-4">
                    Revisa tu información antes de continuar
                  </p>
                  <p className="text-gray-600 mb-8">
                    Asegúrate de haber completado todos los datos necesarios. En
                    el siguiente paso podrás enviar tu solicitud.
                  </p>
                  <div className="flex flex-col w-full gap-3 mt-4">
                    <Button
                      className="bg-[#2c6e49] hover:bg-[#235539] text-white rounded-full py-3"
                      onClick={handleSubmitVerification}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <InlineSpinner className="text-white" />
                          <span>Enviando solicitud...</span>
                        </div>
                      ) : (
                        "Enviar solicitud de verificación"
                      )}
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

      {/* Final Review and Submit - Step 3 - REMOVED: Now submitting directly from Step 2 */}

      {/* Reference Contact Modal */}
      {showReferenceModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
          <div className="bg-white max-w-xl w-full mx-4 max-h-[90vh] relative shadow-lg flex flex-col overflow-hidden rounded-lg">
            {/* Cream-colored top bar with close button */}
            <div className="bg-[#f5f7e9] py-3 px-6 flex justify-between relative sticky top-0 z-10">
              <h3 className="text-xl font-semibold">
                Agregar contacto de referencia
              </h3>
              <button
                onClick={() => setShowReferenceModal(false)}
                className="text-[#478C5C] hover:text-[#2c6e49]"
                aria-label="Cerrar"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main content area */}
            <div className="p-8 overflow-y-auto flex-1">
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
                    Asegúrate de que el email sea válido.
                  </div>
                </div>

                <div>
                  <label className="block text-base font-medium mb-2">
                    Teléfono (opcional)
                  </label>
                  <div className="flex">
                    <CountryCodeSelector
                      value={referenceContact.countryCode}
                      onValueChange={(countryCode) =>
                        setReferenceContact({
                          ...referenceContact,
                          countryCode,
                        })
                      }
                      className="flex-shrink-0 w-[100px] h-12"
                    />
                    <input
                      type="tel"
                      placeholder={getPhonePlaceholder(
                        referenceContact.countryCode
                      )}
                      className="flex-1 h-12 rounded-l-none rounded-r-lg border border-black bg-white px-4 focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 border-l-0"
                      value={referenceContact.phone}
                      onChange={(e) => {
                        const formattedValue = formatPhoneNumber(
                          e.target.value,
                          referenceContact.countryCode
                        );
                        setReferenceContact({
                          ...referenceContact,
                          phone: formattedValue,
                        });
                      }}
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
            </div>

            {/* Button container - fixed at bottom */}
            <div className="flex justify-center p-4 bg-white border-t border-gray-200 sticky bottom-0 z-10">
              <Button
                className="bg-[#478C5C] hover:bg-[#3a7049] text-white rounded-full py-2 px-8"
                onClick={handleReferenceSubmit}
              >
                Guardar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Request Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
          <div className="bg-white max-w-xl w-full mx-4 max-h-[90vh] relative shadow-lg flex flex-col overflow-hidden rounded-lg">
            {/* Cream-colored top bar with close button */}
            <div className="bg-[#f5f7e9] py-3 px-6 flex justify-end relative sticky top-0 z-10">
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-[#478C5C] hover:text-[#2c6e49]"
                aria-label="Cerrar"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main content area */}
            <div className="p-8 overflow-y-auto flex-1">
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

      {/* Success modal with handshake icon */}
      {showSubmitModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
          <div className="bg-white max-w-xl w-full mx-4 max-h-[90vh] relative shadow-lg flex flex-col overflow-hidden rounded-lg">
            {/* Cream-colored top bar with close button */}
            <div className="bg-[#f5f7e9] py-3 px-6 flex justify-end relative sticky top-0 z-10">
              <button
                onClick={handleReturnToCampaign}
                className="text-[#478C5C] hover:text-[#2c6e49]"
                aria-label="Cerrar"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main content area */}
            <div className="p-8 overflow-y-auto flex-1">
              <div className="flex flex-col items-center text-center">
                <div className="mb-6">
                  <Image
                    src="/views/create-campaign/handshake.svg"
                    alt="Handshake"
                    width={64}
                    height={64}
                  />
                </div>
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
                  className="bg-[#478C5C] hover:bg-[#3a7049] text-white rounded-full py-2 px-8 mb-4"
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
      {(isIdDocumentEditing || isSupportingDocEditing) && editingImageUrl && (
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
