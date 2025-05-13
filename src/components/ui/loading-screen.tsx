"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "./loading-spinner";

interface LoadingScreenProps {
  text?: string;
  showText?: boolean;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingScreen({
  text = "Loading...",
  showText = false,
  fullScreen = true,
  className,
}: LoadingScreenProps) {
  // Add a small delay before showing the loading screen for a smoother experience
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    // Short delay before showing loader to prevent flash for quick operations
    const timer = setTimeout(() => setShowLoader(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!showLoader) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-[#f5f7e9]/90 backdrop-blur-sm animate-fadeIn", // Semi-transparent background with blur
        fullScreen ? "fixed inset-0 z-50" : "w-full h-full min-h-[200px]",
        className
      )}
      style={{
        animationDuration: "300ms", // Fast fade-in
      }}
    >
      <LoadingSpinner size="lg" text={text} showText={showText} />
    </div>
  );
}
