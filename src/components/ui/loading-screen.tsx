"use client";

import React from "react";
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
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-[#f5f7e9]", // Light green background
        fullScreen ? "fixed inset-0 z-50" : "w-full h-full min-h-[200px]",
        className
      )}
    >
      <LoadingSpinner size="lg" text={text} showText={showText} />
    </div>
  );
}
