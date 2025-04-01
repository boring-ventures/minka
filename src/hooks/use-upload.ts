import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { uploadMedia } from "@/lib/supabase/upload-media";

interface UploadResponse {
  url: string;
  success: boolean;
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<UploadResponse> => {
    setIsUploading(true);
    setProgress(0);

    try {
      // Upload file to Supabase storage
      const result = await uploadMedia(file);

      // Add to uploaded URLs list
      if (result.success) {
        setUploadedUrls((prev) => [...prev, result.url]);
      }

      return result;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error de carga",
        description: "Error al subir el archivo. Intenta nuevamente.",
        variant: "destructive",
      });

      return {
        url: "",
        success: false,
      };
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  // Upload multiple files and return all URLs
  const uploadFiles = async (files: File[]): Promise<string[]> => {
    if (!files.length) return [];

    setIsUploading(true);
    const urls: string[] = [];

    try {
      for (const file of files) {
        const result = await uploadFile(file);
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
