"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDb } from "@/hooks/use-db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface TransferFundsTabProps {
  campaign: Record<string, any>;
}

export function TransferFundsTab({ campaign }: TransferFundsTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveBar, setShowSaveBar] = useState(false);
  const { createFundTransfer } = useDb();
  const [transferFrequency, setTransferFrequency] =
    useState<string>("monthly_once");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [transferHistory, setTransferHistory] = useState<any[]>([]);

  const initialFormState = useMemo(
    () => ({
      accountHolderName: "",
      bankName: "",
      accountNumber: "",
      amount: 0,
    }),
    []
  );

  const [formData, setFormData] = useState(initialFormState);
  const [transferSuccess, setTransferSuccess] = useState(false);

  useEffect(() => {
    // Check if form has any changes and is valid
    const formChanged =
      formData.accountHolderName.trim() !==
        initialFormState.accountHolderName ||
      formData.bankName !== initialFormState.bankName ||
      formData.accountNumber.trim() !== initialFormState.accountNumber ||
      (formData.amount > 0 && formData.amount !== initialFormState.amount);

    setShowSaveBar(formChanged);
  }, [formData, initialFormState]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setIsLoading(true);

    try {
      const { error } = await createFundTransfer({
        campaignId: campaign.id,
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        amount: formData.amount,
        status: "processing",
        frequency: transferFrequency,
      });

      if (error) throw error;

      setTransferSuccess(true);
      setShowSaveBar(false);

      toast({
        title: "Solicitud enviada",
        description:
          "Tu solicitud de transferencia ha sido enviada y está siendo procesada.",
      });
    } catch (error) {
      console.error("Error requesting transfer:", error);
      toast({
        title: "Error",
        description:
          "No se pudo procesar la solicitud de transferencia. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setShowSaveBar(false);
  };

  const availableAmount = campaign.current_amount || 0;
  const canWithdraw = availableAmount > 0;

  const isFormValid =
    formData.accountHolderName.trim() !== "" &&
    formData.bankName !== "" &&
    formData.accountNumber.trim() !== "" &&
    formData.amount > 0 &&
    formData.amount <= availableAmount;

  const formatCurrency = (amount: number) => {
    return `Bs. ${amount.toLocaleString()}`;
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="w-full px-6 md:px-8 lg:px-16 xl:px-24 py-6 flex flex-col min-h-[calc(100vh-200px)]">
      {/* Content Section - Full Width */}
      <div className="w-full flex-1 flex flex-col">
        <div>
          {/* Main Amount Display - styled as in the image */}
          <div className="mb-6">
            <h3 className="text-3xl md:text-4xl font-bold mb-2 text-[#2c6e49]">
              Bs. 200,00
            </h3>
            <p className="text-sm text-gray-600">Fondos disponible</p>
          </div>

          {/* Account Number Display */}
          <div className="mb-6 flex items-center">
            <span className="text-sm">Nº *****3495</span>
            <button className="ml-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.4745 5.40801L18.5917 7.52524M17.8358 3.54289L11.6003 9.77844C11.3168 10.0619 11.1217 10.4266 11.0433 10.8258L10.5982 13.402L13.1744 12.9569C13.5736 12.8785 13.9383 12.6834 14.2218 12.3999L20.4574 6.16435C20.8076 5.81415 21.0002 5.33862 21.0002 4.84362C21.0002 4.34862 20.8076 3.87309 20.4574 3.52289C20.1072 3.17268 19.6317 2.98004 19.1367 2.98004C18.6417 2.98004 18.1661 3.17268 17.8159 3.52289L17.8358 3.54289Z"
                  stroke="#2B6D48"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19 15V18C19 18.5304 18.7893 19.0391 18.4142 19.4142C18.0391 19.7893 17.5304 20 17 20H6C5.46957 20 4.96086 19.7893 4.58579 19.4142C4.21071 19.0391 4 18.5304 4 18V7C4 6.46957 4.21071 5.96086 4.58579 5.58579C4.96086 5.21071 5.46957 5 6 5H9"
                  stroke="#2B6D48"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Destination Selector */}
          <div className="mb-6">
            <p className="text-sm mb-2">Destino de fontos</p>
            <button className="inline-flex px-6 py-2 border border-[#2c6e49] rounded-full bg-white text-[#2c6e49] hover:bg-[#f0f8f4] font-medium text-sm">
              Transferir fondos
            </button>
          </div>

          {/* Separator before frequency section */}
          <div className="border-t border-gray-200 my-8"></div>

          {/* Frequency of Transfer Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-6">
              Frecuencia de transferencia
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="monthly_once"
                  name="transferFrequency"
                  value="monthly_once"
                  checked={transferFrequency === "monthly_once"}
                  onChange={() => setTransferFrequency("monthly_once")}
                  className="h-5 w-5 text-black border-gray-500"
                />
                <label htmlFor="monthly_once" className="ml-3 text-sm">
                  1 vez al mes
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="radio"
                  id="monthly_twice"
                  name="transferFrequency"
                  value="monthly_twice"
                  checked={transferFrequency === "monthly_twice"}
                  onChange={() => setTransferFrequency("monthly_twice")}
                  className="h-5 w-5 text-black border-gray-500"
                />
                <label htmlFor="monthly_twice" className="ml-3 text-sm">
                  2 veces al mes
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="radio"
                  id="every_90_days"
                  name="transferFrequency"
                  value="every_90_days"
                  checked={transferFrequency === "every_90_days"}
                  onChange={() => setTransferFrequency("every_90_days")}
                  className="h-5 w-5 text-black border-gray-500"
                />
                <label htmlFor="every_90_days" className="ml-3 text-sm">
                  Cada 90 días
                </label>
              </div>
            </div>
          </div>

          {/* Separator after frequency section */}
          <div className="border-t border-gray-200 my-8"></div>

          {/* Transfer History Section */}
          <div className="mt-12">
            <h3 className="text-xl font-bold mb-6">
              Historial de transferencias (0)
            </h3>

            {transferHistory.length > 0 ? (
              <div className="flex-1 flex flex-col">
                {/* Table Header */}
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Monto
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Fecha
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Cuenta
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transferHistory.map((transfer, index) => (
                      <tr key={transfer.id} className="bg-white">
                        <td className="py-4 px-4 text-gray-700">
                          {formatCurrency(transfer.amount)}
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {transfer.date}
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {transfer.account}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="bg-gray-50 p-8 rounded-lg text-center w-full">
                  <div className="flex justify-center">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M12 12L12 16"
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <circle cx="12" cy="8" r="1" fill="#3b82f6" />
                    </svg>
                  </div>
                  <p className="mt-4 text-gray-600">
                    No hay ninguna transferencia registrada por el momento.
                  </p>
                </div>
              </div>
            )}

            {/* Pagination */}
            {transferHistory.length > 0 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  className="flex items-center px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span>Anterior</span>
                </button>

                <button className="h-10 w-10 rounded-full flex items-center justify-center text-sm bg-green-700 text-white border border-green-700">
                  1
                </button>
                <button className="h-10 w-10 rounded-full flex items-center justify-center text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button className="h-10 w-10 rounded-full flex items-center justify-center text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                  3
                </button>
                <span className="px-1 text-gray-500">...</span>
                <button className="h-10 w-10 rounded-full flex items-center justify-center text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                  23
                </button>

                <button
                  className="flex items-center px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <span>Siguiente</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Changes Bar */}
      {showSaveBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-100 py-4 px-6 border-t border-gray-200 z-50 flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            className="border-gray-300 bg-white"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white"
            disabled={isLoading || !isFormValid}
            onClick={handleSubmit}
          >
            {isLoading ? "Procesando..." : "Solicitar transferencia"}
          </Button>
        </div>
      )}
    </div>
  );
}
