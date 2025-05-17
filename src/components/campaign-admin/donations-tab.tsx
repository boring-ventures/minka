"use client";

import { useState, useEffect } from "react";
import {
  Download,
  Search,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCampaign, CampaignDonation } from "@/hooks/use-campaign";

interface DonationsTabProps {
  campaign: Record<string, any>;
}

export function DonationsTab({ campaign }: DonationsTabProps) {
  const [donations, setDonations] = useState<CampaignDonation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<
    CampaignDonation[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalDonations, setTotalDonations] = useState(0);
  const [hasMoreDonations, setHasMoreDonations] = useState(false);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { isLoadingDonations, getCampaignDonations } = useCampaign();

  useEffect(() => {
    fetchDonations();
  }, [campaign.id]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDonations(donations || []);
    } else {
      const filtered = (donations || []).filter(
        (donation) =>
          donation.donor.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          donation.amount.toString().includes(searchTerm)
      );
      setFilteredDonations(filtered);
    }
  }, [searchTerm, donations]);

  const fetchDonations = async (pageNumber: number = 1) => {
    const newOffset = (pageNumber - 1) * limit;

    const donationsData = await getCampaignDonations(
      campaign.id,
      limit,
      newOffset
    );

    if (donationsData) {
      setDonations(donationsData.donations || []);
      setTotalDonations(donationsData.total || 0);
      setTotalAmount(donationsData.totalAmount || 0);
      setHasMoreDonations(donationsData.hasMore || false);
      setCurrentPage(pageNumber);
      setTotalPages(Math.ceil((donationsData.total || 0) / limit));
    }
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchDonations(page);
  };

  const formatCurrency = (amount: number) => {
    return `Bs. ${amount.toLocaleString()}`;
  };

  const handleExportCSV = () => {
    // Check if donations exist before proceeding
    if (!filteredDonations || filteredDonations.length === 0) {
      return;
    }

    // Creating CSV content
    const headers = ["Fecha", "Nombre del donador", "Email", "Monto"];

    const csvRows = [
      headers.join(","),
      ...(filteredDonations || []).map((donation) => {
        const date = new Date(
          donation.createdAt || new Date()
        ).toLocaleDateString();
        const name = (donation.donor?.name || "Unknown").replace(/,/g, " ");
        const email = donation.donor?.email || "No disponible";
        const amount = `Bs. ${donation.amount || 0}`;

        return [date, name, email, amount].join(",");
      }),
    ];

    const csvContent = csvRows.join("\n");

    // Creating a Blob for the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Creating a temporary link and triggering the download
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `donaciones_${(campaign.title || "campaign").replace(/\s+/g, "_").toLowerCase()}_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full px-6 md:px-8 lg:px-16 xl:px-24 py-6">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Donaciones
      </h2>
      <p className="text-xl text-gray-600 leading-relaxed mb-10">
        Monitorea las donaciones recibidas y agradece a tus donadores por su
        apoyo.
      </p>

      <div className="border-b border-[#478C5C]/20 my-8"></div>

      {/* Donations section */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar donador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-gray-300"
            />
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2 border-gray-300"
            onClick={handleExportCSV}
            disabled={!donations || donations.length === 0}
          >
            <Download className="h-4 w-4" />
            Exportar a CSV
          </Button>
        </div>

        {isLoadingDonations && donations.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : filteredDonations.length > 0 ? (
          <div>
            {/* Simple table with header and rows */}
            <div className="border-b border-gray-200">
              <div className="grid grid-cols-3 py-3 text-sm font-medium text-gray-500">
                <div className="px-4">Nombre del donador</div>
                <div className="px-4">Monto donado</div>
                <div className="px-4">Fecha</div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {(filteredDonations || []).map((donation, index) => (
                <div
                  key={donation.id || index}
                  className={`grid grid-cols-3 py-4 ${index % 2 === 1 ? "bg-[#f9faf8]" : ""}`}
                >
                  <div className="px-4 text-gray-700">
                    {donation.donor?.name || "Unknown"}
                  </div>
                  <div className="px-4 text-gray-700">
                    {formatCurrency(donation.amount || 0)}
                  </div>
                  <div className="px-4 text-gray-700">
                    {new Date(
                      donation.createdAt || new Date()
                    ).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-8 space-x-2">
              <Button
                variant="ghost"
                className="py-2 px-4 rounded-full text-gray-600 hover:text-gray-900 flex items-center disabled:opacity-50"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Anterior
              </Button>

              {totalPages > 5 && currentPage > 3 && (
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
                  onClick={() => goToPage(1)}
                >
                  1
                </button>
              )}

              {totalPages > 5 && currentPage > 3 && (
                <span className="px-2 text-gray-500">...</span>
              )}

              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum;

                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                if (pageNum <= 0 || pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    className={`w-10 h-10 flex items-center justify-center rounded-full ${
                      currentPage === pageNum
                        ? "bg-[#2c6e49] text-white"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="px-2 text-gray-500">...</span>
              )}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
                  onClick={() => goToPage(totalPages)}
                >
                  {totalPages}
                </button>
              )}

              <Button
                variant="ghost"
                className="py-2 px-4 rounded-full text-gray-600 hover:text-gray-900 flex items-center disabled:opacity-50"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Siguiente
                <ChevronRight className="h-5 w-5 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay donaciones aún
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Tu campaña no ha recibido donaciones todavía.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
