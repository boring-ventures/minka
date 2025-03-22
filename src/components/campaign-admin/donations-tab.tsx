"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Download, Search, Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface DonationsTabProps {
  campaign: any;
}

type Donation = {
  id: string;
  donor_name: string;
  amount: number;
  created_at: string;
  status: string;
  message?: string;
  is_anonymous: boolean;
};

export function DonationsTab({ campaign }: DonationsTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchDonations();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredDonations(donations);
    } else {
      const filtered = donations.filter(
        (donation) =>
          donation.donor_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          donation.amount.toString().includes(searchTerm) ||
          (donation.message &&
            donation.message.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredDonations(filtered);
    }
  }, [searchTerm, donations]);

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from("donations")
        .select("*, user_profiles(*)")
        .eq("campaign_id", campaign.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedDonations = data.map((donation) => ({
          id: donation.id,
          donor_name: donation.is_anonymous
            ? "Donador anónimo"
            : donation.user_profiles?.name || "Donador",
          amount: donation.amount || 0,
          created_at: donation.created_at,
          status: donation.status || "completed",
          message: donation.message,
          is_anonymous: donation.is_anonymous || false,
        }));

        setDonations(formattedDonations);
        setFilteredDonations(formattedDonations);

        // Calculate total
        const sum = formattedDonations.reduce((acc, donation) => {
          return donation.status === "completed" ? acc + donation.amount : acc;
        }, 0);
        setTotal(sum);
      } else if (process.env.NODE_ENV === "development") {
        // Add dummy donations for development
        const dummyDonations = [
          {
            id: "1",
            donor_name: "Laura Méndez",
            amount: 1500,
            created_at: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "completed",
            message:
              "Gracias por su importante labor de conservación. ¡Sigamos protegiendo nuestra biodiversidad!",
            is_anonymous: false,
          },
          {
            id: "2",
            donor_name: "Donador anónimo",
            amount: 500,
            created_at: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "completed",
            message: "",
            is_anonymous: true,
          },
          {
            id: "3",
            donor_name: "Roberto Gutiérrez",
            amount: 1000,
            created_at: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "completed",
            message:
              "Espero que este aporte ayude a mantener la belleza natural del parque.",
            is_anonymous: false,
          },
          {
            id: "4",
            donor_name: "Sandra Flores",
            amount: 200,
            created_at: new Date(
              Date.now() - 4 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "completed",
            message: "",
            is_anonymous: false,
          },
          {
            id: "5",
            donor_name: "Jorge Paz",
            amount: 800,
            created_at: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "pending",
            message:
              "Cuando vuelva a visitar el parque, me gustaría participar como voluntario.",
            is_anonymous: false,
          },
        ];

        setDonations(dummyDonations);
        setFilteredDonations(dummyDonations);

        // Calculate total of "completed" donations
        const sum = dummyDonations.reduce((acc, donation) => {
          return donation.status === "completed" ? acc + donation.amount : acc;
        }, 0);
        setTotal(sum);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);

      if (process.env.NODE_ENV === "development") {
        // Add dummy donations on error for development
        const dummyDonations = [
          {
            id: "1",
            donor_name: "Laura Méndez",
            amount: 1500,
            created_at: new Date(
              Date.now() - 1 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "completed",
            message:
              "Gracias por su importante labor de conservación. ¡Sigamos protegiendo nuestra biodiversidad!",
            is_anonymous: false,
          },
          {
            id: "2",
            donor_name: "Donador anónimo",
            amount: 500,
            created_at: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "completed",
            message: "",
            is_anonymous: true,
          },
          {
            id: "3",
            donor_name: "Roberto Gutiérrez",
            amount: 1000,
            created_at: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "completed",
            message:
              "Espero que este aporte ayude a mantener la belleza natural del parque.",
            is_anonymous: false,
          },
          {
            id: "4",
            donor_name: "Sandra Flores",
            amount: 200,
            created_at: new Date(
              Date.now() - 4 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "completed",
            message: "",
            is_anonymous: false,
          },
          {
            id: "5",
            donor_name: "Jorge Paz",
            amount: 800,
            created_at: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000
            ).toISOString(),
            status: "pending",
            message:
              "Cuando vuelva a visitar el parque, me gustaría participar como voluntario.",
            is_anonymous: false,
          },
        ];

        setDonations(dummyDonations);
        setFilteredDonations(dummyDonations);

        // Calculate total of "completed" donations
        const sum = dummyDonations.reduce((acc, donation) => {
          return donation.status === "completed" ? acc + donation.amount : acc;
        }, 0);
        setTotal(sum);
      } else {
        toast({
          title: "Error",
          description:
            "No se pudieron cargar las donaciones. Intenta nuevamente.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = [
      "Nombre",
      "Monto",
      "Fecha",
      "Estado",
      "Mensaje",
      "Anónimo",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredDonations.map((donation) => {
        return [
          `"${donation.donor_name}"`,
          donation.amount,
          new Date(donation.created_at).toLocaleDateString(),
          donation.status,
          `"${donation.message || ""}"`,
          donation.is_anonymous ? "Sí" : "No",
        ].join(",");
      }),
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `donaciones_${campaign.id}_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Donaciones</h2>
        <p className="text-sm text-gray-500">
          Visualiza y administra todas las donaciones recibidas en tu campaña
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#F9F9F3] p-4 rounded-lg">
          <p className="text-sm text-gray-500">Total recaudado</p>
          <p className="text-2xl font-bold text-[#2c6e49]">
            Bs. {total.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#F9F9F3] p-4 rounded-lg">
          <p className="text-sm text-gray-500">Número de donaciones</p>
          <p className="text-2xl font-bold text-[#2c6e49]">
            {donations.length}
          </p>
        </div>
        <div className="bg-[#F9F9F3] p-4 rounded-lg">
          <p className="text-sm text-gray-500">Donación promedio</p>
          <p className="text-2xl font-bold text-[#2c6e49]">
            Bs.{" "}
            {donations.length
              ? Math.round(total / donations.length).toLocaleString()
              : "0"}
          </p>
        </div>
      </div>

      {/* Search and Export */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar donación"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="border-gray-300 flex items-center gap-2 w-full md:w-auto"
        >
          <Download className="h-4 w-4" />
          Exportar a CSV
        </Button>
      </div>

      {/* Donations Table */}
      {filteredDonations.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDonations.map((donation) => (
                  <tr key={donation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#e8f0e9] flex items-center justify-center text-[#2c6e49]">
                          {donation.is_anonymous ? (
                            <Heart className="h-4 w-4" />
                          ) : (
                            <span className="font-bold">
                              {donation.donor_name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {donation.donor_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Bs. {donation.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {donation.message || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          donation.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {donation.status === "completed"
                          ? "Completada"
                          : "Pendiente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <Heart className="h-10 w-10 mx-auto text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mt-4">
            No hay donaciones aún
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
            Cuando tu campaña reciba donaciones, aparecerán aquí.
          </p>
        </div>
      )}
    </div>
  );
}
