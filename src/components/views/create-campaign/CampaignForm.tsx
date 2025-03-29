"use client";

import { useCampaignForm } from "@/components/providers/campaign-form-provider";
import { Step1BasicInfo } from "./Step1BasicInfo";
import { Step2Beneficiaries } from "./Step2Beneficiaries";
import { Step3Preview } from "./Step3Preview";

export function CampaignForm() {
  const { state } = useCampaignForm();

  // Render the appropriate step based on the current step in the state
  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <Step1BasicInfo />;
      case 2:
        return <Step2Beneficiaries />;
      case 3:
        return <Step3Preview />;
      default:
        return <Step1BasicInfo />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Auto-save status indicator */}
      <div className="mb-8 flex justify-end">
        <span className="text-sm font-medium text-gray-700">
          {state.autoSaveStatus === "saving" && "Guardando..."}
          {state.autoSaveStatus === "saved" && "Guardado automáticamente"}
          {state.autoSaveStatus === "error" && "Error al guardar"}
        </span>
      </div>

      {/* Step Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2c6e49]">
          {state.currentStep === 1 && "Información de la campaña"}
          {state.currentStep === 2 && "Destino de los fondos"}
          {state.currentStep === 3 && "Revisar y publicar"}
        </h1>
        <p className="text-gray-600 mt-2">
          {state.currentStep === 1 &&
            "Proporciona los detalles básicos de tu campaña"}
          {state.currentStep === 2 &&
            "Describe cómo se utilizarán los fondos recaudados"}
          {state.currentStep === 3 &&
            "Revisa todos los detalles antes de publicar"}
        </p>
      </div>

      {/* Render the current step */}
      {renderStep()}
    </div>
  );
}
