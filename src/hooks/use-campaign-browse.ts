import { useState, useEffect, useCallback } from "react";

// Types
export interface CampaignFilters {
  category?: string;
  location?: string;
  search?: string;
  verified?: boolean;
  verificationStatus?: "verified" | "pending" | "unverified";
  // New filters for future backend support
  createdAfter?: string;
  fundingPercentageMin?: number;
  fundingPercentageMax?: number;
}

export interface SortOption {
  id: string;
  label: string;
}

export interface CampaignItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  goalAmount: number;
  collectedAmount: number;
  donorCount: number;
  percentageFunded: number;
  daysRemaining: number;
  verified: boolean;
  organizer: {
    id: string;
    name: string;
    location: string;
    profilePicture: string | null;
  } | null;
  primaryImage: string | null;
}

export interface CategoryItem {
  name: string;
  count: number;
}

export interface LocationItem {
  name: string;
  count: number;
}

export interface PaginationData {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasMore: boolean;
}

export function useCampaignBrowse() {
  // State for campaigns data
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // State for categories and locations
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [isLocationsLoading, setIsLocationsLoading] = useState(false);

  // State for filtering and pagination
  const [filters, setFilters] = useState<CampaignFilters>({});
  const [sortBy, setSortBy] = useState<string>("popular");
  const [pagination, setPagination] = useState<PaginationData>({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 12,
    hasMore: false,
  });

  // Available sort options
  const sortOptions: SortOption[] = [
    { id: "popular", label: "Más populares" },
    { id: "newest", label: "Más recientes" },
    { id: "most_funded", label: "Más financiadas" },
    { id: "ending_soon", label: "Finalizan pronto" },
  ];

  // Function to fetch campaigns
  const fetchCampaigns = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setError(null);

      try {
        // Build URL with query parameters
        const url = new URL("/api/campaign/list", window.location.origin);

        // Add filters to URL
        if (filters.category)
          url.searchParams.append("category", filters.category);
        if (filters.location)
          url.searchParams.append("location", filters.location);
        if (filters.search) url.searchParams.append("search", filters.search);
        if (filters.verified) url.searchParams.append("verified", "true");
        if (filters.verificationStatus)
          url.searchParams.append(
            "verificationStatus",
            filters.verificationStatus
          );

        // Add new filter parameters
        if (filters.createdAfter)
          url.searchParams.append("createdAfter", filters.createdAfter);
        if (filters.fundingPercentageMin !== undefined)
          url.searchParams.append(
            "fundingPercentageMin",
            filters.fundingPercentageMin.toString()
          );
        if (filters.fundingPercentageMax !== undefined)
          url.searchParams.append(
            "fundingPercentageMax",
            filters.fundingPercentageMax.toString()
          );

        // Add sort and pagination
        url.searchParams.append("sortBy", sortBy);
        url.searchParams.append("page", page.toString());
        url.searchParams.append("limit", pagination.limit.toString());

        console.log("Fetching campaigns with URL:", url.toString());
        console.log("Current filters:", filters);
        console.log("Current sort:", sortBy);
        console.log("Current page:", page);

        const response = await fetch(url.toString());
        const data = await response.json();
        console.log("API response:", data);

        // Check if there is an error message in the response
        if (data.error) {
          setError(data.error);
          console.warn("API returned error:", data.error);
          // Still use any campaigns data that might be returned (e.g., fallback data)
          if (data.campaigns && Array.isArray(data.campaigns)) {
            setCampaigns(data.campaigns);
          }
          if (data.pagination) {
            setPagination(data.pagination);
          }
        } else {
          if (data.campaigns && Array.isArray(data.campaigns)) {
            setCampaigns(data.campaigns);
          } else {
            console.error("Invalid campaigns data:", data);
            setError("Error al cargar campañas: formato inválido");
          }

          if (data.pagination) {
            setPagination(data.pagination);
          }
        }
      } catch (err) {
        setError(
          "Error al cargar campañas. Por favor, intenta de nuevo más tarde."
        );
        console.error("Error fetching campaigns:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, sortBy, pagination.limit]
  );

  // Function to fetch categories
  const fetchCategories = useCallback(async () => {
    setIsCategoriesLoading(true);

    try {
      // Build URL with query parameters to get filtered categories
      const url = new URL("/api/campaign/categories", window.location.origin);

      // Add current filters to get dynamic counts except category itself
      if (filters.location)
        url.searchParams.append("location", filters.location);
      if (filters.search) url.searchParams.append("search", filters.search);
      if (filters.verified) url.searchParams.append("verified", "true");
      if (filters.verificationStatus)
        url.searchParams.append(
          "verificationStatus",
          filters.verificationStatus
        );

      console.log("Fetching categories with URL:", url.toString());

      const response = await fetch(url.toString());
      const data = await response.json();

      // Check if there is an error message in the response
      if (data.error) {
        console.warn("Categories API error:", data.error);
        // Still use any categories data that might be returned (e.g., fallback data)
        setCategories(data.categories || []);
      } else {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      // Don't update the UI with an error for categories
      // since it's not critical for the user experience
    } finally {
      setIsCategoriesLoading(false);
    }
  }, [
    filters.location,
    filters.search,
    filters.verified,
    filters.verificationStatus,
  ]);

  // Function to fetch locations
  const fetchLocations = useCallback(async () => {
    setIsLocationsLoading(true);

    try {
      // Build URL with query parameters to get filtered locations
      const url = new URL("/api/campaign/locations", window.location.origin);

      // Add current filters to get dynamic counts except location itself
      if (filters.category)
        url.searchParams.append("category", filters.category);
      if (filters.search) url.searchParams.append("search", filters.search);
      if (filters.verified) url.searchParams.append("verified", "true");
      if (filters.verificationStatus)
        url.searchParams.append(
          "verificationStatus",
          filters.verificationStatus
        );

      console.log("Fetching locations with URL:", url.toString());

      const response = await fetch(url.toString());
      const data = await response.json();

      // Check if there is an error message in the response
      if (data.error) {
        console.warn("Locations API error:", data.error);
        // Still use any locations data that might be returned (e.g., fallback data)
        setLocations(data.locations || []);
      } else {
        setLocations(data.locations);
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
      // Don't update the UI with an error for locations
      // since it's not critical for the user experience
    } finally {
      setIsLocationsLoading(false);
    }
  }, [
    filters.category,
    filters.search,
    filters.verified,
    filters.verificationStatus,
  ]);

  // Update filters
  const updateFilters = (newFilters: Partial<CampaignFilters>) => {
    console.log("Updating filters with:", newFilters);
    console.log("Previous filters:", filters);
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      console.log("New filters will be:", updated);
      return updated;
    });
    // Reset to page 1 when filters change
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Update sort
  const updateSort = (newSortBy: string) => {
    console.log("Updating sortBy from", sortBy, "to", newSortBy);
    setSortBy(newSortBy);
    // Reset to page 1 when sort changes
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Navigate to a specific page
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchCampaigns(page);
  };

  // Reset all filters
  const resetFilters = () => {
    console.log("Resetting all filters");
    // Set loading state immediately for better UX
    setIsLoading(true);
    setError(null);

    setFilters({});
    setSortBy("popular");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Initial fetch of campaigns, categories, and locations only once on mount
  useEffect(() => {
    // Initial fetch on mount
    if (!isInitialized) {
      console.log("Initial fetch on mount");
      fetchCampaigns();
      fetchCategories();
      fetchLocations();
      setIsInitialized(true);
    }
  }, [isInitialized, fetchCampaigns, fetchCategories, fetchLocations]);

  // Update categories and locations when filters change
  useEffect(() => {
    // Update categories when any non-category filter changes (including when cleared)
    if (isInitialized) {
      fetchCategories();
    }
  }, [
    filters.location,
    filters.search,
    filters.verified,
    filters.verificationStatus,
    fetchCategories,
    isInitialized,
  ]);

  useEffect(() => {
    // Update locations when any non-location filter changes (including when cleared)
    if (isInitialized) {
      fetchLocations();
    }
  }, [
    filters.category,
    filters.search,
    filters.verified,
    filters.verificationStatus,
    fetchLocations,
    isInitialized,
  ]);

  // Fetch campaigns when filters or sort change - but not on initial mount
  useEffect(() => {
    if (isInitialized) {
      console.log("Fetching campaigns due to filter/sort change");
      fetchCampaigns(pagination.currentPage);
    }
  }, [filters, sortBy, pagination.currentPage, fetchCampaigns, isInitialized]);

  return {
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
  };
}
