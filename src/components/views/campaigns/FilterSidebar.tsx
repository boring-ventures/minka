"use client";

import { Search, SlidersHorizontal } from "lucide-react";

export function FilterSidebar() {
  return (
    <div className="w-full md:w-80 flex-shrink-0 p-6 rounded-xl">
      {/* Header with title and icon */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Filtrar resultados</h2>
        <SlidersHorizontal className="h-5 w-5 text-gray-600" />
      </div>

      {/* Search bar */}
      <div className="relative mb-8">
        <div className="relative rounded-full border border-gray-300  flex items-center px-4 py-2">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar campañas"
            className="w-full bg-transparent border-none focus:outline-none text-gray-700"
          />
          <button type="button" className="absolute right-3">
            <Search className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Campañas verificadas */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Campañas verificadas
          </h3>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              className="h-5 w-5 form-checkbox text-[#2c6e49] rounded border-gray-300"
            />
            <span className="text-base text-gray-700">
              Solo campañas verificadas
            </span>
          </label>
        </div>

        {/* Estado de verificación */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Estado de verificación
          </h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-5 w-5 form-checkbox text-[#2c6e49] rounded border-gray-300"
              />
              <span className="text-base text-gray-700">
                En proceso de verificación
              </span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-5 w-5 form-checkbox text-[#2c6e49] rounded border-gray-300"
              />
              <span className="text-base text-gray-700">Sin verificar</span>
            </label>
          </div>
        </div>

        {/* Fecha de creación */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Fecha de creación
          </h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-5 w-5 form-checkbox text-[#2c6e49] rounded border-gray-300"
              />
              <span className="text-base text-gray-700">Últimas 24 horas</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-5 w-5 form-checkbox text-[#2c6e49] rounded border-gray-300"
              />
              <span className="text-base text-gray-700">Últimos 7 días</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-5 w-5 form-checkbox text-[#2c6e49] rounded border-gray-300"
              />
              <span className="text-base text-gray-700">Último mes</span>
            </label>
          </div>
        </div>

        {/* Monto recaudado */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            Monto recaudado
          </h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-5 w-5 form-checkbox text-[#2c6e49] rounded border-gray-300"
              />
              <span className="text-base text-gray-700">
                Menos del 25% de la meta
              </span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-5 w-5 form-checkbox text-[#2c6e49] rounded border-gray-300"
              />
              <span className="text-base text-gray-700">
                Entre el 25% y 75% de la meta
              </span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-5 w-5 form-checkbox text-[#2c6e49] rounded border-gray-300"
              />
              <span className="text-base text-gray-700">
                Más del 75% de la meta
              </span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="h-5 w-5 form-checkbox text-[#2c6e49] rounded border-gray-300"
              />
              <span className="text-base text-gray-700">Meta alcanzada</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
