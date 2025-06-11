"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CurrentStepContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const CurrentStepContext = createContext<CurrentStepContextType | undefined>(
  undefined
);

export const useCurrentStep = () => {
  const context = useContext(CurrentStepContext);
  if (context === undefined) {
    throw new Error("useCurrentStep must be used within a CurrentStepProvider");
  }
  return context;
};

interface CurrentStepProviderProps {
  children: ReactNode;
}

export const CurrentStepProvider = ({ children }: CurrentStepProviderProps) => {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <CurrentStepContext.Provider value={{ currentStep, setCurrentStep }}>
      {children}
    </CurrentStepContext.Provider>
  );
};
