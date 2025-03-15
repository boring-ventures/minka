"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, CreditCard, QrCode } from "lucide-react";

// Define donation amount options
const DONATION_AMOUNTS = [
  { value: 50, label: "Bs. 50,00" },
  { value: 100, label: "Bs. 100,00" },
  { value: 200, label: "Bs. 200,00" },
  { value: 500, label: "Bs. 500,00" },
];

// Define payment methods
const PAYMENT_METHODS = [
  {
    id: "card",
    title: "Tarjeta de crédito/débito",
    description:
      "Ingresa los detalles de tu tarjeta de crédito o débito para procesar tu donación.",
    icon: <CreditCard className="h-6 w-6" />,
  },
  {
    id: "qr",
    title: "Código QR",
    description:
      "Abre la aplicación de tu banco, escanea el código QR y sigue las instrucciones.",
    icon: <QrCode className="h-6 w-6" />,
  },
];

export default function DonatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [receiveNotifications, setReceiveNotifications] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState("Campaña");
  const [campaignOrganizer, setCampaignOrganizer] = useState("Organización");
  const [campaignLocation, setCampaignLocation] = useState("Bolivia");

  // Calculate donation details
  const donationAmount =
    selectedAmount || (customAmount ? Number.parseFloat(customAmount) : 0);
  const platformFee = donationAmount * 0.05; // 5% platform fee
  const totalAmount = donationAmount + platformFee;

  // Load campaign data from URL params
  useEffect(() => {
    // Store campaignId for future API calls if needed
    const title = searchParams.get("title");
    const organizer = searchParams.get("organizer");
    const location = searchParams.get("location");

    if (title) setCampaignTitle(title);
    if (organizer) setCampaignOrganizer(organizer);
    if (location) setCampaignLocation(location);

    // Here you would typically fetch campaign details using the campaignId
  }, [searchParams]);

  // Handle amount selection
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  // Handle custom amount input
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount(null);
    }
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
  };

  // Handle continue to next step
  const handleContinue = () => {
    if (
      step === 1 &&
      (selectedAmount || (customAmount && Number.parseFloat(customAmount) > 0))
    ) {
      setStep(2);
    } else if (step === 2 && paymentMethod) {
      setStep(3);
    }
  };

  // Handle donation confirmation
  const handleConfirmDonation = () => {
    // Here you would typically process the payment
    // For now, we'll just show a success message
    alert("¡Gracias por tu donación!");
    // Redirect to campaign page or success page
    router.push("/campaign?success=true");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Header with campaign info */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#2c6e49]">
                Protejamos juntos el {campaignTitle}
              </h1>
              <p className="text-sm text-gray-600">
                {campaignOrganizer} | {campaignLocation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Step 1: Choose donation amount */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Elige el monto de tu donación
              </h2>
              <p className="text-gray-600 mb-6">
                Selecciona un monto o ingresa la cantidad que prefieras y
                contribuye a generar impacto. Minka retiene un 5% de donación
                para cubrir costos operativos y garantizar el funcionamiento
                seguro de la plataforma.
              </p>

              {/* Predefined amounts */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {DONATION_AMOUNTS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`py-3 px-4 rounded-lg border ${
                      selectedAmount === option.value
                        ? "border-[#2c6e49] bg-[#e8f0e9] text-[#2c6e49]"
                        : "border-gray-200 hover:border-gray-300"
                    } transition-colors`}
                    onClick={() => handleAmountSelect(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="mb-6">
                <label
                  htmlFor="custom-amount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Si prefieres, indica otra cantidad
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    Bs.
                  </span>
                  <input
                    type="text"
                    id="custom-amount"
                    className={`block w-full pl-10 pr-3 py-3 border ${
                      customAmount ? "border-[#2c6e49]" : "border-gray-200"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2c6e49] focus:border-transparent`}
                    placeholder="1.300,00"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                  />
                </div>
              </div>

              {/* Donation info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  ¿Quieres apoyar a Minka? Una contribución voluntaria adicional
                  te permite ser parte de la comunidad solidaria por excelencia.
                </p>
                <div className="flex items-center">
                  <span className="text-sm text-gray-700 mr-2">20%</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full">
                    <div className="h-full w-1/5 bg-[#2c6e49] rounded-full" />
                  </div>
                </div>
              </div>

              {/* Continue button */}
              <Button
                className="w-full bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full py-6"
                onClick={handleContinue}
                disabled={
                  !selectedAmount &&
                  (!customAmount || Number.parseFloat(customAmount) <= 0)
                }
              >
                Continuar
              </Button>
            </div>
          )}

          {/* Step 2: Choose payment method */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Elige el método de pago de tu preferencia
              </h2>
              <p className="text-gray-600 mb-6">
                Marca el método de pago con el que deseas realizar tu aporte. Tu
                donación está protegida.
              </p>

              {/* Payment methods */}
              <div className="space-y-4 mb-6">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    className={`flex items-start w-full text-left p-4 border rounded-lg ${
                      paymentMethod === method.id
                        ? "border-[#2c6e49] bg-[#e8f0e9]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handlePaymentMethodSelect(method.id)}
                  >
                    <div className="flex-shrink-0 mr-4 text-[#2c6e49]">
                      {method.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {method.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {method.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Continue button */}
              <Button
                className="w-full bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full py-6"
                onClick={handleContinue}
                disabled={!paymentMethod}
              >
                Continuar
              </Button>
            </div>
          )}

          {/* Step 3: Confirm donation */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-[#e8f0e9] flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-[#2c6e49]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-center text-gray-900 mb-6">
                Confirma tu donación
              </h2>
              <p className="text-center text-gray-600 mb-6">
                Tu ayuda está a un paso de impulsar sueños. Confirma tu aporte y
                haz crecer esta causa.
              </p>

              {/* Donation summary */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tu donación</span>
                  <span className="font-medium">
                    Bs. {donationAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Aporte para Minka</span>
                  <span className="font-medium">
                    Bs. {platformFee.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">
                    Bs. {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Notifications option */}
              <div className="flex items-start space-x-2 mb-6">
                <Checkbox
                  id="notifications"
                  checked={receiveNotifications}
                  onCheckedChange={(checked) =>
                    setReceiveNotifications(checked as boolean)
                  }
                  className="mt-1"
                />
                <div>
                  <label
                    htmlFor="notifications"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Recibir notificaciones
                  </label>
                  <p className="text-xs text-gray-500">
                    Recibe actualizaciones por correo electrónico y/o mensaje de
                    texto.
                  </p>
                </div>
              </div>

              {/* Confirm button */}
              <Button
                className="w-full bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full py-6"
                onClick={handleConfirmDonation}
              >
                Confirmar donación <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Step indicator */}
          <div className="flex justify-center">
            <div className="flex space-x-2">
              <div
                className={`h-2 w-8 rounded-full ${
                  step >= 1 ? "bg-[#2c6e49]" : "bg-gray-200"
                }`}
              />
              <div
                className={`h-2 w-8 rounded-full ${
                  step >= 2 ? "bg-[#2c6e49]" : "bg-gray-200"
                }`}
              />
              <div
                className={`h-2 w-8 rounded-full ${
                  step >= 3 ? "bg-[#2c6e49]" : "bg-gray-200"
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
