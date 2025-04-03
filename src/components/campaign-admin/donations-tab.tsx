"use client";

import { useState, useEffect } from "react";
import { Download, Search, Heart, CheckCircle, XCircle } from "lucide-react";

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
  const [limit] = useState(20);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  const {
    isLoadingDonations,
    isUpdatingDonation,
    getCampaignDonations,
    updateDonationStatus,
  } = useCampaign();

  useEffect(() => {
    fetchDonations();
  }, [campaign.id]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDonations(donations);
    } else {
      const filtered = donations.filter(
        (donation) =>
          donation.donor.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          donation.amount.toString().includes(searchTerm) ||
          (donation.message &&
            donation.message.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredDonations(filtered);
    }
  }, [searchTerm, donations]);

  const fetchDonations = async (reset: boolean = true) => {
    const currentOffset = reset ? 0 : offset;

    const donationsData = await getCampaignDonations(
      campaign.id,
      limit,
      currentOffset
    );

    if (donationsData) {
      if (reset) {
        setDonations(donationsData.donations);
      } else {
        setDonations([...donations, ...donationsData.donations]);
      }

      setTotalDonations(donationsData.total);
      setTotalAmount(donationsData.totalAmount);
      setHasMoreDonations(donationsData.hasMore);

      if (!reset) {
        setOffset(currentOffset + limit);
      } else {
        setOffset(limit);
      }
    }
  };

  const loadMoreDonations = () => {
    fetchDonations(false);
  };

  const handleUpdateDonationStatus = async (
    donationId: string,
    status: "pending" | "active" | "rejected"
  ) => {
    setIsUpdating({
      ...isUpdating,
      [donationId]: true,
    });

    try {
      const success = await updateDonationStatus(
        campaign.id,
        donationId,
        status
      );

      if (success) {
        // Update the donation in the local state
        const updatedDonations = donations.map((donation) => {
          if (donation.id === donationId) {
            return {
              ...donation,
              status,
            };
          }
          return donation;
        });

        setDonations(updatedDonations);
        setFilteredDonations(updatedDonations);

        // Refresh donations to get updated total amount
        fetchDonations();
      }
    } finally {
      setIsUpdating({
        ...isUpdating,
        [donationId]: false,
      });
    }
  };

  const handleExportCSV = () => {
    // Creating CSV content
    const headers = [
      "Fecha",
      "Nombre del donador",
      "Email",
      "Monto",
      "Mensaje",
      "Anónimo",
      "Estado",
    ];

    const csvRows = [
      headers.join(","),
      ...filteredDonations.map((donation) => {
        const date = new Date(donation.createdAt).toLocaleDateString();
        const name = donation.donor.name.replace(/,/g, " ");
        const email = donation.donor.email || "No disponible";
        const amount = donation.amount;
        const message = donation.message
          ? `"${donation.message.replace(/"/g, '""')}"`
          : "";
        const anonymous = donation.isAnonymous ? "Sí" : "No";
        const status =
          donation.status === "active"
            ? "Completada"
            : donation.status === "pending"
              ? "Pendiente"
              : "Rechazada";

        return [date, name, email, amount, message, anonymous, status].join(
          ","
        );
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
      `donaciones_${campaign.title.replace(/\s+/g, "_").toLowerCase()}_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: "BOB",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format the amount with the donation's specific currency
  const formatDonationAmount = (donation: CampaignDonation) => {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency: getCurrency(donation),
      minimumFractionDigits: 0,
    }).format(donation.amount);
  };

  // Add a helper to ensure we have a currency value
  const getCurrency = (donation: CampaignDonation) => {
    return donation.currency || "BOB"; // Default to BOB if currency field is missing
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Donaciones recibidas</h2>
        <p className="text-gray-600 mb-6">
          Gestiona las donaciones recibidas para tu campaña y revisa los
          mensajes de tus donadores.
        </p>
      </div>

      {/* Donation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg space-y-1">
          <p className="text-sm text-gray-500">Monto recaudado</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalAmount)}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg space-y-1">
          <p className="text-sm text-gray-500">Meta</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(campaign.goal_amount || 0)}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg space-y-1">
          <p className="text-sm text-gray-500">Número de donadores</p>
          <p className="text-2xl font-bold text-gray-900">{totalDonations}</p>
        </div>
      </div>

      {/* Search and export */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Buscar por nombre, monto o mensaje..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleExportCSV}
          disabled={donations.length === 0}
        >
          <Download className="h-4 w-4" />
          Exportar a CSV
        </Button>
      </div>

      {/* Donation list */}
      {isLoadingDonations && donations.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : filteredDonations.length > 0 ? (
        <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Donador
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Monto
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Mensaje
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDonations.map((donation) => (
                <tr key={donation.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative">
                        <div className="h-10 w-10 rounded-full bg-[#e8f0e9] flex items-center justify-center">
                          {donation.isAnonymous ? (
                            <Heart className="h-5 w-5 text-[#2c6e49]" />
                          ) : (
                            <span className="text-[#2c6e49] font-bold">
                              {donation.donor.name.charAt(0)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {donation.donor.name}
                          {donation.isAnonymous && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Anónimo
                            </span>
                          )}
                        </div>
                        {donation.donor.email && (
                          <div className="text-sm text-gray-500">
                            {donation.donor.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDonationAmount(donation)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(donation.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs line-clamp-2">
                      {donation.message || "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        donation.status === "active"
                          ? "bg-green-100 text-green-800"
                          : donation.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {donation.status === "active"
                        ? "Completada"
                        : donation.status === "pending"
                          ? "Pendiente"
                          : "Rechazada"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {donation.status !== "active" && (
                      <button
                        className="text-green-600 hover:text-green-900 mr-3"
                        onClick={() =>
                          handleUpdateDonationStatus(donation.id, "active")
                        }
                        disabled={isUpdating[donation.id] || isUpdatingDonation}
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                    {donation.status !== "rejected" && (
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() =>
                          handleUpdateDonationStatus(donation.id, "rejected")
                        }
                        disabled={isUpdating[donation.id] || isUpdatingDonation}
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    )}
                    {(isUpdating[donation.id] || isUpdatingDonation) && (
                      <LoadingSpinner size="sm" className="inline ml-2" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {hasMoreDonations && (
            <div className="flex justify-center py-4">
              <Button
                variant="outline"
                className="border-gray-300"
                onClick={loadMoreDonations}
                disabled={isLoadingDonations}
              >
                {isLoadingDonations ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : null}
                Cargar más donaciones
              </Button>
            </div>
          )}
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
  );
}
