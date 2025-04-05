import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { uploadMedia } from "@/lib/supabase/upload-media";

interface UploadResponse {
  url: string;
  success: boolean;
}

type ProgressCallback = (progress: number) => void;

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const { toast } = useToast();

  const uploadFile = async (
    file: File,
    progressCallback?: ProgressCallback
  ): Promise<UploadResponse> => {
    setIsUploading(true);
    setProgress(0);

    try {
      // Simulate progress updates if progressCallback is provided
      if (progressCallback) {
        const interval = setInterval(() => {
          const newProgress = Math.min(
            95,
            Math.floor(Math.random() * 10) + progress
          );
          setProgress(newProgress);
          progressCallback(newProgress);
        }, 300);

        // Upload file to Supabase storage
        const result = await uploadMedia(file);

        // Clear the interval and set progress to 100
        clearInterval(interval);
        setProgress(100);
        progressCallback(100);

        // Add to uploaded URLs list
        if (result.success) {
          setUploadedUrls((prev) => [...prev, result.url]);
        }

        return result;
      } else {
        // Upload without progress tracking
        const result = await uploadMedia(file);

        // Add to uploaded URLs list
        if (result.success) {
          setUploadedUrls((prev) => [...prev, result.url]);
        }

        return result;
      }
    } catch (error) {
      console.error("Error uploading file:", error);

      // Check if it's an authentication error (usually thrown by Supabase)
      const errorMessage =
        error instanceof Error ? error.message : "Error al subir el archivo";

      if (
        errorMessage.includes("auth") ||
        errorMessage.includes("authentication") ||
        errorMessage.includes("session") ||
        errorMessage.includes("JWT") ||
        errorMessage.includes("token") ||
        errorMessage.includes("unauthorized")
      ) {
        toast({
          title: "Error de autenticación",
          description:
            "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión e intenta nuevamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error de carga",
          description: errorMessage,
          variant: "destructive",
        });
      }

      return {
        url: "",
        success: false,
      };
    } finally {
      setIsUploading(false);
      if (!progressCallback) {
        setProgress(0);
      }
    }
  };

  // Upload multiple files and return all URLs
  const uploadFiles = async (
    files: File[],
    progressCallback?: ProgressCallback
  ): Promise<string[]> => {
    if (!files.length) return [];

    setIsUploading(true);
    const urls: string[] = [];

    try {
      for (const file of files) {
        const result = await uploadFile(file, progressCallback);
        if (result.success) {
          urls.push(result.url);
        }
      }

      return urls;
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Error de carga",
        description: "Error al subir archivos. Intenta nuevamente.",
        variant: "destructive",
      });
      return urls;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    progress,
    uploadedUrls,
    setUploadedUrls,
    uploadFile,
    uploadFiles,
  };
}
