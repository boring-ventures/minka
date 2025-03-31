import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface UploadResponse {
  url: string;
  success: boolean;
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const { toast } = useToast();

  // For demonstration purposes, this is a mock upload function
  // In a real implementation, you would connect to your actual upload service
  const uploadFile = async (file: File): Promise<UploadResponse> => {
    setIsUploading(true);
    setProgress(0);

    try {
      // In a real implementation, this would be an actual upload
      // For demo purposes, we'll simulate progress and return a placeholder URL

      // Simulate progress
      for (let i = 0; i <= 10; i++) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        setProgress(i * 10);
      }

      // Mock successful upload
      const uploadUrl = `https://example.com/uploads/${file.name}`;

      // Add to uploaded URLs list
      setUploadedUrls((prev) => [...prev, uploadUrl]);

      return {
        url: uploadUrl,
        success: true,
      };
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
    uploadFile,
    uploadFiles,
  };
}
