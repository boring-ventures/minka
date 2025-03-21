"use client";

import { useState } from "react";
import { Button } from "./button";
import { useLoading } from "./loading-provider";

export function LoadingDemo() {
  const { showLoading, hideLoading } = useLoading();
  const [loadingTime, setLoadingTime] = useState(2000);

  const handleShowLoading = () => {
    showLoading();

    // Automatically hide the loading after the specified time
    setTimeout(() => {
      hideLoading();
    }, loadingTime);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h2 className="text-xl font-bold text-[#356945]">
        Demostración de Loading
      </h2>

      <div className="flex items-center gap-2">
        <label htmlFor="loadingTime" className="text-sm text-gray-700">
          Tiempo de carga (ms):
        </label>
        <input
          id="loadingTime"
          type="number"
          value={loadingTime}
          onChange={(e) => setLoadingTime(Number(e.target.value))}
          className="w-24 rounded border border-gray-300 px-2 py-1 text-sm"
          min={500}
          max={10000}
          step={500}
        />
      </div>

      <Button
        onClick={handleShowLoading}
        className="bg-[#356945] hover:bg-[#2a5537]"
      >
        Mostrar Cargando
      </Button>

      <p className="mt-2 text-sm text-gray-600">
        Haz clic en el botón para mostrar el componente de carga durante el
        tiempo especificado.
      </p>
    </div>
  );
}
