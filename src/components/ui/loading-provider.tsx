"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { LoadingScreen } from "./loading-screen";

interface LoadingContextProps {
  showLoading: (text?: string, showText?: boolean) => void;
  hideLoading: () => void;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextProps | undefined>(
  undefined
);

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  const [showText, setShowText] = useState(false);

  const showLoading = (text?: string, showText: boolean = false) => {
    if (text) {
      setLoadingText(text);
    }
    setShowText(showText);
    setLoading(true);
  };

  const hideLoading = () => {
    setLoading(false);
  };

  return (
    <LoadingContext.Provider
      value={{
        showLoading,
        hideLoading,
        isLoading: loading,
      }}
    >
      {children}
      {loading && <LoadingScreen text={loadingText} showText={showText} />}
    </LoadingContext.Provider>
  );
}

export function useLoading(): LoadingContextProps {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
