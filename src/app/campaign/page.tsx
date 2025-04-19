"use client";

import { CategorySelector } from "@/components/views/campaigns/CategorySelector";
import { FilterSidebar } from "@/components/views/campaigns/FilterSidebar";
import { CampaignCard } from "@/components/views/campaigns/CampaignCard";
import { Header } from "@/components/views/landing-page/Header";
import { Footer } from "@/components/views/landing-page/Footer";
import { ChevronDown, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useCampaignBrowse, SortOption } from "@/hooks/use-campaign-browse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchParams, useRouter } from "next/navigation";

export default function CampaignsPage() {
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
    filters,
    sortBy,
    sortOptions,
    pagination,
    updateFilters,
    updateSort,
    goToPage,
    resetFilters,
  } = useCampaignBrowse();

  // Set initial category from URL if available
  useEffect(() => {
    if (categoryFromUrl) {
      updateFilters({ category: categoryFromUrl });
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

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchQuery });
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

  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-[#f5f7e9]">
      <Header />
      <div className="pt-24">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#333333] mb-6">
              Apoya una causa,
              <br />
              cambia una vida
            </h1>
            <p className="text-2xl md:text-3xl text-[#555555] max-w-3xl mx-auto mb-12">
              Explora todas las campañas activas o encuentra las de tu interés
              según categoría.
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
                onChange={(e) => setSearchQuery(e.target.value)}
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
            selectedCategory={filters.category}
            onSelectCategory={(category) => updateFilters({ category })}
          />

          <div className="flex flex-col md:flex-row gap-10 mt-16">
            <FilterSidebar
              locations={locations}
              filters={filters}
              onUpdateFilters={updateFilters}
              onResetFilters={resetFilters}
            />

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-[#333333]">
                    {filters.category
                      ? `Campañas en ${filters.category}`
                      : filters.search
                        ? `Resultados para "${filters.search}"`
                        : "Todas las campañas"}
                  </h2>
                  <p className="text-xl text-[#555555]">
                    {isLoading
                      ? "Cargando..."
                      : `${pagination.totalCount} Resultados`}
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

              {/* Loading state */}
              {isLoading && (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c6e49]"></div>
                  <p className="mt-4 text-[#555555]">Cargando campañas...</p>
                </div>
              )}

              {/* No results state */}
              {!isLoading && campaigns.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-xl text-[#555555]">
                    No se encontraron campañas para tu búsqueda.
                  </p>
                  <Button
                    onClick={resetFilters}
                    variant="outline"
                    className="mt-4 border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49] hover:text-white"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              )}

              {/* Campaign grid */}
              {!isLoading && campaigns && campaigns.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {campaigns.map((campaign) =>
                    campaign && campaign.id ? (
                      <CampaignCard
                        key={campaign.id}
                        id={campaign.id}
                        title={campaign.title || "Sin título"}
                        image={
                          campaign.primaryImage ||
                          "/landing-page/dummies/Card/Imagen.png"
                        }
                        category={campaign.category || "Sin categoría"}
                        location={campaign.location || "Sin ubicación"}
                        progress={campaign.percentageFunded || 0}
                        verified={campaign.verified || false}
                        description={campaign.description || "Sin descripción"}
                        donorCount={campaign.donorCount || 0}
                        amountRaised={`Bs. ${(campaign.collectedAmount || 0).toLocaleString("es-BO")}`}
                      />
                    ) : null
                  )}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handlePrevPage}
                      disabled={pagination.currentPage === 1}
                      variant="outline"
                      className="border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49] hover:text-white"
                    >
                      Anterior
                    </Button>

                    <div className="flex gap-1">
                      {Array.from({
                        length: Math.min(5, pagination.totalPages),
                      }).map((_, i) => {
                        // Create a window of pages around the current page
                        let pageNumber;
                        if (pagination.totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (
                          pagination.currentPage >=
                          pagination.totalPages - 2
                        ) {
                          pageNumber = pagination.totalPages - 4 + i;
                        } else {
                          pageNumber = pagination.currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNumber}
                            onClick={() => goToPage(pageNumber)}
                            variant={
                              pagination.currentPage === pageNumber
                                ? "default"
                                : "outline"
                            }
                            className={
                              pagination.currentPage === pageNumber
                                ? "bg-[#2c6e49] hover:bg-[#1e4d33]"
                                : "border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49] hover:text-white"
                            }
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      onClick={handleNextPage}
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      variant="outline"
                      className="border-[#2c6e49] text-[#2c6e49] hover:bg-[#2c6e49] hover:text-white"
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
