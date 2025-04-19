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

// Loading component for Suspense
function CampaignsLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c6e49]"></div>
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
              {isLoading ? (
                <div className="text-center py-20">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c6e49]"></div>
                </div>
              ) : campaigns.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {campaigns.map((campaign) => (
                      <CampaignCard
                        key={campaign.id}
                        id={campaign.id}
                        title={campaign.title}
                        image={campaign.primaryImage || ""}
                        category={campaign.category}
                        location={campaign.location}
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
                    onClick={resetFilters}
                    className="bg-[#2c6e49] hover:bg-[#2c6e49]/90"
                  >
                    Limpiar filtros
                  </Button>
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

// Main page component with Suspense
export default function CampaignsPage() {
  return (
    <Suspense fallback={<CampaignsLoading />}>
      <CampaignsContent />
    </Suspense>
  );
}
