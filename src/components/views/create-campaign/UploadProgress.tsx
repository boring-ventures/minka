"use client";

import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface UploadProgressProps {
  progress: number;
  fileName: string;
}

export function UploadProgress({ progress, fileName }: UploadProgressProps) {
  const [displayFileName, setDisplayFileName] = useState("");

  useEffect(() => {
    // Truncate file name if too long
    if (fileName.length > 20) {
      setDisplayFileName(fileName.slice(0, 15) + "..." + fileName.slice(-5));
    } else {
      setDisplayFileName(fileName);
    }
  }, [fileName]);

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-4 mb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{displayFileName}</span>
        <span className="text-xs text-gray-500">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-[#478C5C] h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {progress < 100 && (
        <div className="flex items-center justify-center mt-2">
          <LoadingSpinner size="sm" />
        </div>
      )}
    </div>
  );
}
