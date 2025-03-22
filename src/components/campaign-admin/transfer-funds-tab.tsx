"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

interface TransferFundsTabProps {
  campaign: any;
}

export function TransferFundsTab({ campaign }: TransferFundsTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    amount: 0,
  });
  const [transferSuccess, setTransferSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // This would be replaced with actual transfer logic in production
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For demonstration purposes
      const supabase = createClientComponentClient();

      const { error } = await supabase.from("fund_transfers").insert({
        campaign_id: campaign.id,
        account_holder_name: formData.accountHolderName,
        bank_name: formData.bankName,
        account_number: formData.accountNumber,
        amount: formData.amount,
        status: "processing",
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      setTransferSuccess(true);

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

  const availableAmount = campaign.current_amount || 0;
  const canWithdraw = availableAmount > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Transferir fondos</h2>
        <p className="text-sm text-gray-500">
          Transfiere los fondos recaudados a tu cuenta bancaria
        </p>
      </div>

      {/* Available Balance */}
      <div className="p-6 bg-[#F9F9F3] rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">
              Monto disponible para transferir
            </p>
            <p className="text-3xl font-bold text-[#2c6e49]">
              Bs. {availableAmount.toLocaleString()}
            </p>
          </div>
          {canWithdraw && <ArrowRight className="h-5 w-5 text-[#2c6e49]" />}
        </div>
      </div>

      {transferSuccess ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            ¡Solicitud de transferencia enviada!
          </h3>
          <p className="text-gray-600 mb-6">
            Tu solicitud de transferencia de Bs.{" "}
            {formData.amount.toLocaleString()} ha sido enviada. El proceso puede
            tardar de 2 a 3 días hábiles.
          </p>
          <Button
            className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white"
            onClick={() => setTransferSuccess(false)}
          >
            Hacer otra transferencia
          </Button>
        </div>
      ) : canWithdraw ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="accountHolderName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre del titular de la cuenta
              </label>
              <Input
                id="accountHolderName"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleInputChange}
                placeholder="Nombre completo"
                className="w-full border-gray-300"
                required
              />
            </div>

            <div>
              <label
                htmlFor="bankName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Banco
              </label>
              <select
                id="bankName"
                name="bankName"
                value={formData.bankName}
                onChange={handleInputChange}
                className="w-full rounded-md border border-gray-300 py-2 px-3"
                required
              >
                <option value="">Selecciona un banco</option>
                <option value="Banco de Crédito de Bolivia">
                  Banco de Crédito de Bolivia
                </option>
                <option value="Banco Mercantil Santa Cruz">
                  Banco Mercantil Santa Cruz
                </option>
                <option value="Banco BISA">Banco BISA</option>
                <option value="Banco Nacional de Bolivia">
                  Banco Nacional de Bolivia
                </option>
                <option value="Banco Ganadero">Banco Ganadero</option>
                <option value="Banco Económico">Banco Económico</option>
                <option value="Banco Unión">Banco Unión</option>
                <option value="Banco FIE">Banco FIE</option>
                <option value="Banco Prodem">Banco Prodem</option>
                <option value="Banco Fassil">Banco Fassil</option>
                <option value="Banco Fortaleza">Banco Fortaleza</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="accountNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Número de cuenta
              </label>
              <Input
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                placeholder="Número de cuenta bancaria"
                className="w-full border-gray-300"
                required
              />
            </div>

            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Monto a transferir
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  Bs.
                </span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min={1}
                  max={availableAmount}
                  value={formData.amount || ""}
                  onChange={handleInputChange}
                  className="pl-10 w-full border-gray-300"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Monto máximo: Bs. {availableAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-700">
                La transferencia puede tardar de 2 a 3 días hábiles en
                procesarse. Recibirás una confirmación por correo electrónico
                cuando se complete.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white"
              disabled={
                isLoading ||
                !formData.amount ||
                formData.amount <= 0 ||
                formData.amount > availableAmount
              }
            >
              {isLoading ? "Procesando..." : "Solicitar transferencia"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay fondos disponibles para transferir
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Cuando tu campaña reciba donaciones, podrás transferir los fondos a
            tu cuenta bancaria.
          </p>
        </div>
      )}

      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-medium mb-4">
          Historial de transferencias
        </h3>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay transferencias previas</p>
        </div>
      </div>
    </div>
  );
}
