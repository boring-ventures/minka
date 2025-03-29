"use client";

import React from "react";
import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  text?: string;
  className?: string;
};

export function LoadingSpinner({
  size = "md",
  showText = false,
  text = "Cargando...",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-4 border-t-transparent border-[#2c6e49]",
          sizeClasses[size]
        )}
      />
      {showText && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}
