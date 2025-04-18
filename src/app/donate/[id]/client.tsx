"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, CreditCard, QrCode, Bell } from "lucide-react";
import { Header } from "@/components/views/landing-page/Header";
import { Footer } from "@/components/views/landing-page/Footer";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useCampaign } from "@/hooks/useCampaign";
import React from "react";
import { Switch } from "@/components/ui/switch";
import { CheckIcon } from "@/components/icons/CheckIcon";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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

// Create a client component that uses params
export function DonatePageContent({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Use our custom hook to fetch campaign data
  const {
    campaign,
    isLoading: campaignLoading,
    error: campaignError,
  } = useCampaign(campaignId);

  // Add user state
  const [user, setUser] = useState<any>(null);

  // State variables
  const [step, setStep] = useState(1);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [receiveNotifications, setReceiveNotifications] = useState(false);
  const [minkaContribution, setMinkaContribution] = useState<number>(5);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showNotificationSection, setShowNotificationSection] = useState(false);
  const [selectedAmountIndex, setSelectedAmountIndex] = useState(0);
  const [selectedPaymentMethodIndex, setSelectedPaymentMethodIndex] = useState<
    number | null
  >(null);
  const [donationId, setDonationId] = useState<string | null>(null);

  // State for error notification
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate donation details
  const donationAmount =
    selectedAmount || (customAmount ? Number.parseFloat(customAmount) : 0);
  const platformFee = donationAmount * (minkaContribution / 100); // User-selected percentage for platform fee
  const totalAmount = donationAmount + platformFee;

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
    // Set the selectedPaymentMethodIndex based on the method ID
    const index = PAYMENT_METHODS.findIndex((pm) => pm.id === method);
    if (index !== -1) {
      setSelectedPaymentMethodIndex(index);
    }
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

  // Handle going back to previous step
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Handle donation confirmation
  const handleConfirmDonation = async () => {
    if (!campaignId) {
      setErrorMessage("No campaign selected for donation.");
      return;
    }

    // Clear any previous errors
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData?.user || null);

      // Determine if this is an anonymous donation
      const isAnonymous = !userData?.user;

      // Create donation through our API
      const donationData = {
        campaignId: campaignId,
        amount: donationAmount,
        paymentMethod:
          selectedPaymentMethodIndex !== null
            ? PAYMENT_METHODS[selectedPaymentMethodIndex].id
            : paymentMethod || "card",
        message: "",
        isAnonymous: isAnonymous, // Explicitly set isAnonymous flag
        notificationEnabled: receiveNotifications,
        customAmount: !selectedAmount && customAmount ? true : false,
      };

      const response = await fetch("/api/donation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(donationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error submitting donation:", errorData.error);
        throw new Error(errorData.error || "Error submitting donation");
      }

      const data = await response.json();

      // Store donation ID for notification updates
      if (data && data.donationId) {
        setDonationId(data.donationId);
      }

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error submitting donation:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error desconocido al enviar la donación"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle closing success modal
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setStep(4); // Show step 4 with notifications options
  };

  // Handle notification toggle
  const handleNotificationToggle = async (checked: boolean) => {
    setReceiveNotifications(checked);
    // If we have a donation ID, update the notification preference in the database
    if (donationId) {
      try {
        console.log(
          "Updating notification preference for donation:",
          donationId,
          "to:",
          checked
        );

        // Clear any previous errors
        setErrorMessage(null);

        // Update notification preference in the database
        const response = await fetch(`/api/donation/${donationId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ notificationEnabled: checked }),
        });

        const responseData = await response
          .json()
          .catch(() => ({ error: "Failed to parse response" }));

        if (!response.ok) {
          console.error(
            "Failed to update notification preference:",
            responseData
          );

          // Set an error message
          setErrorMessage(
            `No se pudo actualizar la preferencia de notificación: ${responseData.error || "Error desconocido"}`
          );
          return;
        }

        console.log(
          "Successfully updated notification preference:",
          responseData
        );
      } catch (error) {
        console.error("Error updating notification preference:", error);
        setErrorMessage(
          "Error al actualizar la preferencia de notificación. Inténtalo de nuevo."
        );
      }
    } else {
      // If no donation ID yet, the preference will be saved with the donation when submitted
      console.log(
        "No donation ID available, notification preference saved for next donation"
      );
    }
  };

  // Handle slider change for Minka contribution
  const handleMinkaContributionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setMinkaContribution(Number(e.target.value));
  };

  if (campaignLoading) {
    return <DonatePageLoading />;
  }

  if (campaignError) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-white to-[#f5f7e9] flex items-center justify-center">
        <div className="text-center px-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-medium text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">{campaignError}</p>
          <Button
            className="mt-6 bg-[#2c6e49] hover:bg-[#1e4d33] text-white"
            onClick={() => router.push("/campaigns")}
          >
            Ver otras campañas
          </Button>
        </div>
      </div>
    );
  }

  // Default values if campaign data isn't available
  const campaignTitle = campaign?.title || "Parque Nacional Amboró";
  const campaignImage =
    campaign?.media && campaign.media.length > 0
      ? campaign.media[0].media_url
      : "/amboro-campaign.jpg";
  const organizer = {
    name: campaign?.organizer?.name || "Andrés Martínez Saucedo",
    role: "Organizador de campaña",
    location:
      campaign?.location ||
      campaign?.organizer?.location ||
      "Santa Cruz de la Sierra, Bolivia",
    profilePicture: campaign?.organizer?.profilePicture || null,
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-[#f5f7e9]">
      <Header />

      {/* Spacer div to account for the fixed header height */}
      <div className="h-20 md:h-28"></div>

      {/* Page header with increased height */}
      <div className="w-full h-[300px] md:h-[500px] relative border-t border-[#2c6e49]/5">
        <Image
          src="/page-header.svg"
          alt="Page Header"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[90px] font-bold text-white text-center">
            Impulsa sueños con tu donación
          </h1>
        </div>
      </div>

      {/* Campaign info header - updated to match design */}
      <div className="w-full py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-6">
            <div className="text-center md:text-left md:flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-[#2c6e49] mb-4">
                Protejamos juntos el {campaignTitle}
              </h2>

              {/* Organizer details without background */}
              <div className="inline-flex items-center pl-1 pr-4 py-1">
                <div className="w-8 h-8 rounded-full bg-[#2c6e49] flex-shrink-0 mr-2 overflow-hidden">
                  {organizer.profilePicture ? (
                    <Image
                      src={organizer.profilePicture}
                      alt={organizer.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-xs">
                      {organizer.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-[#2c6e49]">
                    {organizer.name}
                  </span>
                  <div className="flex text-xs text-gray-600">
                    <span>
                      {organizer.role} | {organizer.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:flex-1">
              <div className="rounded-lg overflow-hidden h-[180px] max-w-[400px] mx-auto">
                <Image
                  src={campaignImage}
                  alt={campaignTitle}
                  width={400}
                  height={180}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="overflow-x-hidden">
        <div className="container mx-auto py-12">
          {showNotificationSection ? (
            <div className="max-w-2xl mx-auto rounded-lg bg-green-50 p-6 mt-8">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <Bell className="h-6 w-6 text-green-700" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    Recibe actualizaciones sobre tu donación (opcional)
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Puedes recibir notificaciones sobre el progreso de la
                    campaña y cómo se está utilizando tu donación para ayudar.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notification-toggle"
                        checked={receiveNotifications}
                        onCheckedChange={handleNotificationToggle}
                      />
                      <label
                        htmlFor="notification-toggle"
                        className="cursor-pointer"
                      >
                        {receiveNotifications
                          ? "Recibirás notificaciones"
                          : "No recibirás notificaciones"}
                      </label>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button
                      onClick={() => router.push(`/campaigns/${campaignId}`)}
                      className="px-6 py-2 bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-md"
                    >
                      Volver a la campaña
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Choose donation amount */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-4">
                  {/* Left column: Title and description */}
                  <div className="md:col-span-5">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-6 leading-tight">
                      Elige el monto de tu donación
                    </h2>
                    <p className="text-gray-600">
                      Selecciona un monto o ingresa la cantidad que prefieras y
                      contribuye a generar impacto. Minka retiene un porcentaje
                      de donación para cubrir costos operativos y garantizar el
                      funcionamiento seguro de la plataforma.
                    </p>
                  </div>

                  {/* Right column: Donation form */}
                  <div className="md:col-span-7">
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-black">
                      <h3 className="text-lg font-semibold text-black mb-4">
                        Selecciona un monto
                      </h3>

                      {/* Predefined amounts */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {DONATION_AMOUNTS.map((option, index) => (
                          <button
                            key={option.value}
                            type="button"
                            className={`py-3 px-4 rounded-lg border ${
                              selectedAmount === option.value
                                ? "border-black bg-gray-100 text-black"
                                : "border-black hover:bg-gray-100 text-black"
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
                          className="block text-sm font-medium text-black mb-2"
                        >
                          Si prefieres, indica otra cantidad
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black">
                            Bs.
                          </span>
                          <input
                            type="text"
                            id="custom-amount"
                            className="block w-full pl-10 pr-3 py-3 border border-black rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-black"
                            placeholder="1.300,00"
                            value={customAmount}
                            onChange={handleCustomAmountChange}
                          />
                        </div>
                      </div>

                      {/* Donation info - updated with slider - border and bg removed */}
                      <div className="mb-6">
                        <p className="text-sm text-black mb-3">
                          ¿Quieres apoyar a Minka? Una contribución voluntaria
                          adicional te permite ser parte de la comunidad
                          solidaria por excelencia.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-black">0%</span>
                            <span className="text-sm text-black font-medium">
                              {minkaContribution}%
                            </span>
                            <span className="text-sm text-black">100%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={minkaContribution}
                            onChange={handleMinkaContributionChange}
                            className="w-full h-2 rounded-full appearance-none bg-gray-300 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2c6e49]"
                          />
                        </div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-sm text-black">
                            Tu contribución a Minka:
                          </span>
                          <span className="text-sm font-medium text-black">
                            Bs. {platformFee.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Total section */}
                      <div className="mb-6 pb-4 border-b border-gray-200">
                        <div className="flex justify-between">
                          <span className="font-medium text-black">Total</span>
                          <span className="font-medium text-black">
                            Bs. {totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Choose payment method */}
              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-4">
                  {/* Left column: Title and description */}
                  <div className="md:col-span-5">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-6 leading-tight">
                      Elige el método de pago
                    </h2>
                    <p className="text-gray-600">
                      Marca el método de pago con el que deseas realizar tu
                      aporte. Tu donación está protegida.
                    </p>
                  </div>

                  {/* Right column: Payment method cards */}
                  <div className="md:col-span-7">
                    <div className="space-y-4">
                      {/* Credit/Debit Card Option */}
                      <div
                        className={`bg-white rounded-lg p-6 border ${
                          paymentMethod === "card"
                            ? "border-[#2c6e49]"
                            : "border-black"
                        } cursor-pointer hover:border-[#2c6e49] transition-colors`}
                        onClick={() => handlePaymentMethodSelect("card")}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-6 w-6 rounded-full border border-gray-300 flex items-center justify-center">
                              {paymentMethod === "card" ? (
                                <div className="h-3 w-3 rounded-full bg-[#2c6e49]"></div>
                              ) : null}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <CreditCard className="h-6 w-6 text-gray-600" />
                              <h3 className="font-medium text-gray-800 text-lg">
                                Tarjeta de crédito/débito
                              </h3>
                            </div>
                            <p className="text-base text-gray-600">
                              Ingresa los detalles de tu tarjeta de crédito o
                              débito para procesar tu donación.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* QR Code Option */}
                      <div
                        className={`bg-white rounded-lg p-6 border ${
                          paymentMethod === "qr"
                            ? "border-[#2c6e49]"
                            : "border-black"
                        } cursor-pointer hover:border-[#2c6e49] transition-colors`}
                        onClick={() => handlePaymentMethodSelect("qr")}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            <div className="h-6 w-6 rounded-full border border-gray-300 flex items-center justify-center">
                              {paymentMethod === "qr" ? (
                                <div className="h-3 w-3 rounded-full bg-[#2c6e49]"></div>
                              ) : null}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <QrCode className="h-6 w-6 text-gray-600" />
                              <h3 className="font-medium text-gray-800 text-lg">
                                Código QR
                              </h3>
                            </div>
                            <p className="text-base text-gray-600">
                              Abre la aplicación de tu banco, escanea el código
                              QR y sigue las instrucciones.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Confirm donation */}
              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-4">
                  {/* Left column: Title and description */}
                  <div className="md:col-span-5">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-6 leading-tight">
                      Confirma tu donación
                    </h2>
                    <p className="text-gray-600">
                      Tu ayuda está a un paso de impulsar sueños. Confirma tu
                      aporte y haz crecer esta causa.
                    </p>
                  </div>

                  {/* Right column: Confirmation form */}
                  <div className="md:col-span-7">
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-black">
                      <div className="flex flex-col items-center mb-6">
                        <Image
                          src="/landing-page/step-4.svg"
                          alt="Donation"
                          width={60}
                          height={60}
                          className="mb-2"
                        />
                        <h3 className="text-lg font-medium text-center text-[#2c6e49]">
                          Tu donación
                        </h3>
                      </div>

                      {/* Donation summary */}
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tu donación</span>
                          <span className="font-medium">
                            Bs. {donationAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Aporte para Minka
                          </span>
                          <span className="font-medium">
                            Bs. {platformFee.toFixed(2)}
                          </span>
                        </div>
                        <div className="border-t border-gray-200 pt-3 flex justify-between">
                          <span className="font-medium">Total</span>
                          <span className="font-medium">
                            Bs. {totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Show error message if there is one */}
                      {errorMessage && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative mb-4">
                          <span className="block sm:inline">
                            {errorMessage}
                          </span>
                          <button
                            className="absolute top-0 bottom-0 right-0 px-4 py-3"
                            onClick={() => setErrorMessage(null)}
                          >
                            <span className="sr-only">Cerrar</span>
                            <svg
                              className="h-6 w-6 text-red-500"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      )}

                      {/* Confirm button - responsive sizing */}
                      <div className="flex justify-center">
                        <Button
                          className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full px-8 py-3"
                          onClick={handleConfirmDonation}
                          disabled={isSubmitting}
                        >
                          Confirmar donación{" "}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Notification preferences */}
              {step === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-4">
                  {/* Left column: Title and description */}
                  <div className="md:col-span-5">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#333333] mb-6 leading-tight">
                      Recibe actualizaciones sobre tu donación (opcional)
                    </h2>
                    <p className="text-gray-600">
                      Sigue el avance de la campaña y descubre el impacto de tu
                      aporte.
                    </p>
                  </div>

                  {/* Right column: Notification preferences */}
                  <div className="md:col-span-7">
                    <div
                      className={`bg-white rounded-lg shadow-sm p-6 mb-8 border ${receiveNotifications ? "border-[#2c6e49]" : "border-black"} hover:border-[#2c6e49] transition-colors`}
                    >
                      <div
                        className="flex items-start space-x-4 cursor-pointer"
                        onClick={() =>
                          handleNotificationToggle(!receiveNotifications)
                        }
                      >
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-6 w-6 rounded-full border border-gray-300 flex items-center justify-center">
                            {receiveNotifications ? (
                              <div className="h-3 w-3 rounded-full bg-[#2c6e49]"></div>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <Image
                              src="/icons/notifications.svg"
                              alt="Notifications"
                              width={28}
                              height={28}
                              className="mt-1"
                            />
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                Recibir notificaciones
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Recibe actualizaciones por correo electrónico
                                y/o SMS
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Show error message if there is one */}
                    {errorMessage && (
                      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative mb-4">
                        <span className="block sm:inline">{errorMessage}</span>
                        <button
                          className="absolute top-0 bottom-0 right-0 px-4 py-3"
                          onClick={() => setErrorMessage(null)}
                        >
                          <span className="sr-only">Cerrar</span>
                          <svg
                            className="h-6 w-6 text-red-500"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Complete button */}
                    <div className="flex justify-center mt-8">
                      <Button
                        className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full px-8 py-3"
                        onClick={() => router.push("/")}
                      >
                        Completar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="max-w-3xl mx-auto mt-8 mb-4 px-4 flex justify-between">
                {step > 1 && (
                  <Button
                    className="bg-white border border-[#2c6e49] text-[#2c6e49] hover:bg-[#e8f0e9] rounded-full px-6 py-2"
                    onClick={handleBack}
                  >
                    Volver
                  </Button>
                )}

                {step < 3 && (
                  <Button
                    className={`ml-auto bg-[#2c6e49] hover:bg-[#1e4d33] text-white px-8 py-3 rounded-full ${
                      step > 1 ? "" : "mx-auto"
                    }`}
                    onClick={handleContinue}
                    disabled={
                      (step === 1 &&
                        !selectedAmount &&
                        (!customAmount ||
                          Number.parseFloat(customAmount) <= 0)) ||
                      (step === 2 && !paymentMethod)
                    }
                  >
                    Continuar <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-800/75 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full relative shadow-xl">
            {/* Darker header with X button */}
            <div className="bg-[#FCF9ED] p-3 flex justify-end">
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={handleCloseSuccessModal}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Content area with cream background */}
            <div className="bg-[#FFFDF7] text-center p-8">
              {/* Heart icon from SVG */}
              <div className="mx-auto flex justify-center">
                <Image
                  src="/icons/heart.svg"
                  alt="Heart"
                  width={48}
                  height={48}
                  priority
                />
              </div>

              <h3 className="mt-3 text-xl font-bold text-gray-900">
                ¡Gracias por ser parte del cambio!
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                Tu aporte ayuda a construir un futuro mejor.
              </p>

              <p className="mt-1 text-sm text-gray-600">
                ¡Juntos somos más fuertes!
              </p>

              {/* Black separator */}
              <div className="border-t border-black my-4"></div>

              {/* Button with flat corners */}
              <button
                type="button"
                className="inline-flex justify-center border-0 bg-[#2c6e49] px-16 py-2 text-sm font-medium text-white hover:bg-[#1e4d33] focus:outline-none rounded-full"
                onClick={handleCloseSuccessModal}
              >
                Inicio
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// Loading fallback component
export function DonatePageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-[#f5f7e9] flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" showText={true} text="Cargando..." />
      </div>
    </div>
  );
}
