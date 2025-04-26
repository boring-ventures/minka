"use client";

import { CategorySelector } from "@/components/views/campaigns/CategorySelector";
import { FilterSidebar } from "@/components/views/campaigns/FilterSidebar";
import { CampaignCard } from "@/components/views/campaigns/CampaignCard";
import { Header } from "@/components/views/landing-page/Header";
import { Footer } from "@/components/views/landing-page/Footer";
import { ChevronDown, Search } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useCampaignBrowse, SortOption } from "@/hooks/use-campaign-browse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams, useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Loading component for Suspense
function CampaignsLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" showText text="Cargando campañas..." />
    </div>
  );
}

// Main campaign content component that uses useSearchParams
function CampaignsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get category from URL if it exists
  const categoryFromUrl = searchParams.get("category");

  // Initialize the campaign browse hook
  const {
    campaigns,
    isLoading,
    error,
    categories,
    locations,
    isCategoriesLoading,
    isLocationsLoading,
    filters,
    sortBy,
    sortOptions,
    pagination,
    updateFilters,
    updateSort,
    goToPage,
    resetFilters,
  } = useCampaignBrowse();

  // This function maps display names to DB enum values for categories
  const mapCategoryToEnum = (displayName: string): string => {
    const categoryMap: Record<string, string> = {
      "Cultura y arte": "cultura_arte",
      Educación: "educacion",
      Emergencia: "emergencia",
      Igualdad: "igualdad",
      "Medio ambiente": "medioambiente",
      Salud: "salud",
      Otros: "otros",
    };

    return categoryMap[displayName] || displayName;
  };

  // This function maps DB enum values to display names for categories
  const mapEnumToCategory = (enumValue: string): string => {
    const displayMap: Record<string, string> = {
      cultura_arte: "Cultura y arte",
      educacion: "Educación",
      emergencia: "Emergencia",
      igualdad: "Igualdad",
      medioambiente: "Medio ambiente",
      salud: "Salud",
      otros: "Otros",
    };

    return displayMap[enumValue] || enumValue;
  };

  // This function maps display names to DB enum values for locations
  const mapLocationToEnum = (displayName: string): string => {
    const locationMap: Record<string, string> = {
      "La Paz": "la_paz",
      "Santa Cruz": "santa_cruz",
      Cochabamba: "cochabamba",
      Sucre: "sucre",
      Oruro: "oruro",
      Potosí: "potosi",
      Tarija: "tarija",
      Beni: "beni",
      Pando: "pando",
    };

    return locationMap[displayName] || displayName;
  };

  // This function maps DB enum values to display names for locations
  const mapEnumToLocation = (enumValue: string): string => {
    const displayMap: Record<string, string> = {
      la_paz: "La Paz",
      santa_cruz: "Santa Cruz",
      cochabamba: "Cochabamba",
      sucre: "Sucre",
      oruro: "Oruro",
      potosi: "Potosí",
      tarija: "Tarija",
      beni: "Beni",
      pando: "Pando",
    };

    return displayMap[enumValue] || enumValue;
  };

  // Convert any category from URL to its DB enum value
  useEffect(() => {
    if (categoryFromUrl) {
      // If the category is a display name, map it to enum value
      const enumValue = mapCategoryToEnum(categoryFromUrl);
      console.log(
        `Setting initial category from URL: ${categoryFromUrl} -> ${enumValue}`
      );
      updateFilters({ category: enumValue });
    }
  }, [categoryFromUrl, updateFilters]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectOption = (option: SortOption) => {
    updateSort(option.id);
    setIsDropdownOpen(false);
  };

  // Find the selected sort option label
  const selectedSortOption =
    sortOptions.find((option) => option.id === sortBy) || sortOptions[0];

  // Handle search form submission with logging and confirmation
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Performing search for:", searchQuery);

    // Trim the search query to remove whitespace
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery) {
      updateFilters({
        search: trimmedQuery,
        // Reset other filters when searching to avoid conflicts
        category: undefined,
        location: undefined,
      });
      console.log("Updated filters for search:", { search: trimmedQuery });
    } else {
      // If search is empty, clear the search filter
      updateFilters({ search: undefined });
      console.log("Cleared search filter due to empty query");
    }
  };

  // Update search input with proper state tracking
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle pagination
  const handlePrevPage = () => {
    if (pagination.currentPage > 1) {
      goToPage(pagination.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      goToPage(pagination.currentPage + 1);
    }
  };

  // Modified function to handle category selection
  const handleCategorySelect = (category: string | undefined) => {
    if (category) {
      // Convert display name to enum value for DB query
      const enumValue = mapCategoryToEnum(category);
      console.log(`Selected category: ${category} -> ${enumValue}`);
      updateFilters({ category: enumValue });
    } else {
      updateFilters({ category: undefined });
    }
  };

  // Modified function to handle location selection
  const handleLocationSelect = (location: string | undefined) => {
    if (location) {
      // Convert display name to enum value for DB query
      const enumValue = mapLocationToEnum(location);
      console.log(`Selected location: ${location} -> ${enumValue}`);
      updateFilters({ location: enumValue });
    } else {
      updateFilters({ location: undefined });
    }
  };

  // Enhanced reset function to clear search and all filters
  const handleResetFilters = () => {
    console.log("Resetting all filters and search");
    // Clear search input
    setSearchQuery("");
    // Reset all filters in the hook
    resetFilters();
  };

  // Helper to get display name for UI selection state
  const getDisplayCategory = (category?: string): string | undefined => {
    if (!category) return undefined;
    return mapEnumToCategory(category);
  };

  // Helper to get display name for UI selection state
  const getDisplayLocation = (location?: string): string | undefined => {
    if (!location) return undefined;
    return mapEnumToLocation(location);
  };

  // Helper to get display title for the results section
  const getResultsTitle = () => {
    if (filters.search) {
      return `Resultados para "${filters.search}"`;
    }

    if (filters.category) {
      const displayCategory = getDisplayCategory(filters.category);
      return `Campañas en ${displayCategory}`;
    }

    return "Todas las campañas";
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-[#f5f7e9]">
      <Header />
      <div className="pt-24">
        <main className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[70vh]">
              <LoadingSpinner size="lg" showText text="Cargando campañas..." />
            </div>
          ) : (
            <>
              <div className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#333333] mb-6">
                  Apoya una causa,
                  <br />
                  cambia una vida
                </h1>
                <p className="text-2xl md:text-3xl text-[#555555] max-w-3xl mx-auto mb-12">
                  Explora todas las campañas activas o encuentra las de tu
                  interés según categoría.
                </p>

                {/* Search bar */}
                <form
                  onSubmit={handleSearch}
                  className="flex max-w-md mx-auto relative"
                >
                  <Input
                    type="text"
                    placeholder="Buscar campañas..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="pr-10 rounded-full border-[#2c6e49] focus-visible:ring-[#2c6e49]"
                  />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 bottom-0 text-[#2c6e49]"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </form>
              </div>

              <CategorySelector
                categories={categories}
                selectedCategory={getDisplayCategory(filters.category)}
                onSelectCategory={handleCategorySelect}
                isLoading={isCategoriesLoading}
              />

              <div className="flex flex-col md:flex-row gap-10 mt-16">
                <FilterSidebar
                  locations={locations}
                  filters={{
                    ...filters,
                    location: getDisplayLocation(filters.location),
                  }}
                  onUpdateFilters={(newFilters) => {
                    // Special handling for location filter
                    if (newFilters.location) {
                      handleLocationSelect(newFilters.location);
                    } else {
                      // For other filters or when clearing location
                      updateFilters(newFilters);
                    }
                  }}
                  onResetFilters={handleResetFilters}
                  isLocationsLoading={isLocationsLoading}
                />

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-[#333333]">
                        {getResultsTitle()}
                      </h2>
                      <p className="text-xl text-[#555555]">
                        {pagination.totalCount} Resultados
                      </p>
                    </div>

                    <div className="relative mt-4 sm:mt-0">
                      <div className="flex items-center">
                        <span className="mr-3 text-[#555555] font-medium">
                          Ordenar por:
                        </span>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={toggleDropdown}
                            className="flex items-center justify-between bg-transparent py-2 px-4 min-w-[160px] text-[#333333] font-medium focus:outline-none"
                          >
                            <span>{selectedSortOption.label}</span>
                            <ChevronDown
                              className={`h-4 w-4 text-gray-600 ml-2 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                            />
                          </button>

                          {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-sm z-10">
                              {sortOptions.map((option) => (
                                <button
                                  key={option.id}
                                  type="button"
                                  onClick={() => selectOption(option)}
                                  className={`block w-full text-left px-4 py-2 hover:bg-[#e9ebd8] ${
                                    sortBy === option.id
                                      ? "text-[#2c6e49] font-medium"
                                      : "text-[#333333]"
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
                      {error}
                    </div>
                  )}

                  {campaigns.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {campaigns.map((campaign) => (
                          <CampaignCard
                            key={campaign.id}
                            id={campaign.id}
                            title={campaign.title}
                            image={campaign.primaryImage || ""}
                            category={campaign.category}
                            location={campaign.location as any}
                            progress={campaign.percentageFunded}
                            verified={campaign.verified}
                            description={campaign.description}
                            donorCount={campaign.donorCount}
                            amountRaised={`Bs. ${campaign.collectedAmount.toLocaleString("es-BO")}`}
                          />
                        ))}
                      </div>

                      {/* Pagination controls */}
                      {pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center mt-12 space-x-2">
                          <Button
                            variant="outline"
                            onClick={handlePrevPage}
                            disabled={pagination.currentPage === 1}
                          >
                            Anterior
                          </Button>

                          {/* Page numbers */}
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: pagination.totalPages }).map(
                              (_, index) => (
                                <Button
                                  key={index}
                                  variant={
                                    pagination.currentPage === index + 1
                                      ? "default"
                                      : "outline"
                                  }
                                  className={
                                    pagination.currentPage === index + 1
                                      ? "bg-[#2c6e49] hover:bg-[#2c6e49]/90"
                                      : ""
                                  }
                                  onClick={() => goToPage(index + 1)}
                                >
                                  {index + 1}
                                </Button>
                              )
                            )}
                          </div>

                          <Button
                            variant="outline"
                            onClick={handleNextPage}
                            disabled={
                              pagination.currentPage === pagination.totalPages
                            }
                          >
                            Siguiente
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-lg">
                      <p className="text-xl text-gray-600 mb-4">
                        No se encontraron campañas con estos filtros.
                      </p>
                      <Button
                        onClick={handleResetFilters}
                        className="bg-[#2c6e49] hover:bg-[#2c6e49]/90"
                      >
                        Limpiar filtros
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function CampaignsPage() {
  return (
    <Suspense fallback={<CampaignsLoading />}>
      <CampaignsContent />
    </Suspense>
  );
}
