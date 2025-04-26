"use client";

import {
  Search,
  SlidersHorizontal,
  Check,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { CampaignFilters } from "@/hooks/use-campaign-browse";

export interface LocationItem {
  name: string;
  count: number;
}

interface FilterSidebarProps {
  locations: LocationItem[];
  filters: CampaignFilters;
  onUpdateFilters: (newFilters: Partial<CampaignFilters>) => void;
  onResetFilters: () => void;
  isLocationsLoading?: boolean;
}

export function FilterSidebar({
  locations,
  filters,
  onUpdateFilters,
  onResetFilters,
  isLocationsLoading = false,
}: FilterSidebarProps) {
  const [isCertifiedMenuOpen, setIsCertifiedMenuOpen] = useState(true);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(true);

  const toggleCertifiedMenu = () => {
    setIsCertifiedMenuOpen(!isCertifiedMenuOpen);
  };

  const toggleLocationMenu = () => {
    setIsLocationMenuOpen(!isLocationMenuOpen);
  };

  // Default locations if none are provided
  const defaultLocations: LocationItem[] = [
    { name: "La Paz", count: 45 },
    { name: "Santa Cruz", count: 38 },
    { name: "Cochabamba", count: 25 },
    { name: "Sucre", count: 12 },
    { name: "Oruro", count: 8 },
  ];

  // Use provided locations or defaults if empty
  const displayLocations = locations.length > 0 ? locations : defaultLocations;

  const handleVerifiedChange = (verified: boolean) => {
    onUpdateFilters({ verified });
  };

  const handleLocationChange = (location: string | undefined) => {
    onUpdateFilters({ location });
  };

  return (
    <div className="w-full md:w-72 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden h-fit">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-[#333333] mb-4">Filtros</h2>
        <button
          onClick={onResetFilters}
          className="text-[#2c6e49] hover:underline font-medium"
          disabled={isLocationsLoading}
        >
          Limpiar filtros
        </button>
      </div>

      {/* Certified Organizations Section */}
      <div className="border-b border-gray-100">
        <button
          onClick={toggleCertifiedMenu}
          className="flex items-center justify-between w-full p-6 text-left"
        >
          <span className="text-lg font-medium text-[#333333]">Verificado</span>
          <ChevronDown
            className={`h-5 w-5 text-[#2c6e49] transition-transform ${
              isCertifiedMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isCertifiedMenuOpen && (
          <div className="px-6 pb-6">
            <div
              className="flex items-center mb-2 cursor-pointer"
              onClick={() => handleVerifiedChange(true)}
            >
              <div
                className={`w-5 h-5 rounded-sm border mr-3 flex items-center justify-center ${
                  filters.verified
                    ? "bg-[#2c6e49] border-[#2c6e49]"
                    : "border-gray-400"
                }`}
              >
                {filters.verified && <Check className="h-4 w-4 text-white" />}
              </div>
              <span className="text-[#333333]">Mostrar solo verificadas</span>
            </div>
          </div>
        )}
      </div>

      {/* Location Section */}
      <div className="border-b border-gray-100">
        <button
          onClick={toggleLocationMenu}
          className="flex items-center justify-between w-full p-6 text-left"
        >
          <span className="text-lg font-medium text-[#333333]">Ubicación</span>
          <ChevronDown
            className={`h-5 w-5 text-[#2c6e49] transition-transform ${
              isLocationMenuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isLocationMenuOpen && (
          <div className="px-6 pb-6">
            <div
              className="flex items-center mb-3 cursor-pointer"
              onClick={() =>
                !isLocationsLoading && handleLocationChange(undefined)
              }
            >
              <div
                className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                  !filters.location
                    ? "bg-[#2c6e49] border-[#2c6e49]"
                    : "border-gray-400"
                } ${isLocationsLoading ? "opacity-50" : ""}`}
              >
                {!filters.location && (
                  <div className="h-3 w-3 rounded-full bg-white"></div>
                )}
              </div>
              <span
                className={`text-[#333333] ${isLocationsLoading ? "opacity-50" : ""}`}
              >
                Todas
              </span>
            </div>

            {isLocationsLoading ? (
              <div className="flex items-center justify-start ml-2 mt-4 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin mr-2 text-[#2c6e49]" />
                <span>Actualizando ubicaciones...</span>
              </div>
            ) : (
              displayLocations.map((location) => (
                <div
                  key={location.name}
                  className="flex items-center mb-3 cursor-pointer"
                  onClick={() => handleLocationChange(location.name)}
                >
                  <div
                    className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${
                      filters.location === location.name
                        ? "bg-[#2c6e49] border-[#2c6e49]"
                        : "border-gray-400"
                    }`}
                  >
                    {filters.location === location.name && (
                      <div className="h-3 w-3 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-[#333333]">{location.name}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({location.count})
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
