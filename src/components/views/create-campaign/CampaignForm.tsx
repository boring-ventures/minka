"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  User,
  Users,
  Building2,
  X,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Update the form sections (showing only the modified parts)
export function CampaignForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    goal: "",
    hasNoGoal: true,
    location: "",
    duration: "",
    story: "",
    recipient: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showOtraPersonaModal, setShowOtraPersonaModal] = useState(false);
  const [showONGsModal, setShowONGsModal] = useState(false);

  const handlePublish = () => {
    setShowSuccessModal(true);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const closeOtraPersonaModal = () => {
    setShowOtraPersonaModal(false);
  };

  const closeONGsModal = () => {
    setShowONGsModal(false);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Update all input backgrounds to white */}
        <style jsx global>{`
          input,
          textarea,
          select,
          .bg-card {
            background-color: white !important;
          }
          input:focus,
          textarea:focus,
          select:focus {
            border-color: #478c5c !important;
            outline: none !important;
          }
        `}</style>

        {/* Campaign Name */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="pt-4">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Nombre de la campaña
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Dale un nombre claro a tu campaña y agrega una breve explicación
                o detalle para transmitir rápidamente su esencia y objetivo.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-black p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-medium mb-2">
                    Nombre de la campaña
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ingresa el nombre de tu campaña"
                      className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 h-14 px-4"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      maxLength={80}
                    />
                    <div className="text-sm text-gray-500 text-right mt-1">
                      {formData.name.length}/80
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium mb-2">
                    Detalle
                  </label>
                  <div className="relative">
                    <textarea
                      placeholder="Ejemplo: Su conservación depende de nosotros"
                      rows={4}
                      className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 p-4"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      maxLength={150}
                    />
                    <div className="text-sm text-gray-500 text-right mt-1">
                      {formData.description.length}/150
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 border-b border-[#478C5C]/20" />
        </div>

        {/* Category */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="pt-4">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Selecciona una categoría
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Categoriza una categoría y tu campaña va ser encontrada más
                fácilmente por los donadores potenciales.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-black p-8">
              <label className="block text-lg font-medium mb-2">
                Categoría
              </label>
              <select
                className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 h-14 px-4"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="">Selecciona una categoría</option>
                <option value="medioambiente">Medioambiente</option>
                <option value="educacion">Educación</option>
                <option value="salud">Salud</option>
              </select>
            </div>
          </div>
          <div className="mt-16 border-b border-[#478C5C]/20" />
        </div>

        {/* Fundraising Goal */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="pt-4">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Establece una meta de recaudación
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Define una meta realista que te ayude a alcanzar el objetivo de
                tu campaña.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-black p-8">
              <div className="space-y-4">
                <label className="block text-lg font-medium mb-2">
                  Meta de recaudación
                </label>
                <input
                  type="number"
                  placeholder="Ingresa el monto a recaudar"
                  className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 h-14 px-4"
                  value={formData.goal}
                  onChange={(e) =>
                    setFormData({ ...formData, goal: e.target.value })
                  }
                />
                <div className="flex items-center gap-2 bg-[#EDF2FF] border border-[#365AFF] rounded-lg p-2 mt-4">
                  <Image
                    src="/views/create-campaign/Form/info.svg"
                    alt="Info"
                    width={20}
                    height={20}
                  />
                  <span className="text-base text-gray-600">
                    Este será el monto objetivo de tu campaña
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 border-b border-[#478C5C]/20" />
        </div>

        {/* Media Upload */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="pt-4">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Agrega fotos y videos que ilustren tu causa
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Imágenes poderosas que cuenten tu historia harán que tu campaña
                sea más personal y emotiva. Esto ayudará a inspirar y conectar
                con más personas que apoyen tu causa.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-black p-8">
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-400 rounded-lg p-10 text-center bg-white">
                  <div className="flex flex-col items-center justify-center">
                    <Image
                      src="/views/create-campaign/Agregar foto/add_ad.svg"
                      alt="Add media"
                      width={42}
                      height={42}
                      className="mb-4"
                    />
                    <p className="text-sm text-gray-500 mb-4">
                      Arrastra o carga tus fotos aquí
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      Sólo archivos en formato JPEG, PNG y máximo 2 MB
                    </p>
                    <Button
                      variant="outline"
                      className="bg-[#2c6e49] text-white hover:bg-[#1e4d33] border-0 rounded-full"
                    >
                      Seleccionar
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-center my-6">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <div className="px-4 text-gray-500">O</div>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                <div>
                  <div className="relative group">
                    <h3 className="text-lg font-medium mb-3 text-black inline-block cursor-help">
                      Agregar enlace de YouTube
                    </h3>
                    <div className="absolute left-0 bottom-full mb-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <div className="relative bg-[#f5f7e9] text-gray-700 rounded-lg p-3 max-w-xs">
                        <div className="absolute w-3 h-3 bg-[#f5f7e9] transform rotate-45 left-3 -bottom-1.5"></div>
                        <p className="text-sm relative z-10">
                          Sube tu video a Youtube y luego copia y pega el enlace
                          aquí.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <Image
                      src="/views/create-campaign/add_link.svg"
                      alt="Add link"
                      width={20}
                      height={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                    />
                    <input
                      type="text"
                      placeholder="Enlace de YouTube"
                      className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 h-14 pl-12 px-4"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 border-b border-[#478C5C]/20" />
        </div>

        {/* Location */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="pt-4">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Señala la ubicación de tu campaña
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                ¿Dónde se desarrolla tu campaña? Agrega su ubicación.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-black p-8">
              <label className="block text-lg font-medium mb-2">
                Ubicación de la campaña
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="¿Adónde irán los fondos?"
                  className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 pl-10 h-14 px-4"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <button className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Image
                  src="/views/create-campaign/Form/Base/info.svg"
                  alt="Info"
                  width={16}
                  height={16}
                />
                <span className="text-base text-gray-600">Campo opcional</span>
              </div>
            </div>
          </div>
          <div className="mt-16 border-b border-[#478C5C]/20" />
        </div>

        {/* Duration */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="pt-4">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Define el tiempo que durará tu campaña
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                ¿Hasta qué fecha deberá estar vigente tu campaña? Establece un
                tiempo de duración. Toma en cuenta que, una vez publicada tu
                campaña, no podrás modificar este plazo.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-black p-6">
              <label className="block text-lg font-medium mb-2">
                Fecha de finalización
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 pl-10 h-14 px-4"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="mt-16 border-b border-[#478C5C]/20" />
        </div>

        {/* Campaign Story */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="pt-4">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ahora sí: ¡Cuenta tu historia!
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Inspira a los demás compartiendo el propósito de tu proyecto. Sé
                claro y directo para que tu causa conecte de manera profunda con
                quienes pueden hacer la diferencia.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-black p-6">
              <div className="relative">
                <label className="block text-lg font-medium mb-2">
                  Presentación de la campaña
                </label>
                <textarea
                  rows={4}
                  placeholder="Ejemplo: Su conservación depende de nosotros"
                  className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 p-4"
                  value={formData.story}
                  onChange={(e) =>
                    setFormData({ ...formData, story: e.target.value })
                  }
                  maxLength={600}
                />
                <div className="text-sm text-gray-500 text-right mt-1">
                  {formData.story.length}/600
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 border-b border-[#478C5C]/20" />
        </div>

        {/* Full-width header for "Destino de los fondos" */}
        <div className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] h-[400px] mt-16">
          <Image
            src="/page-header.svg"
            alt="Page Header"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-[80px] font-bold text-white">
              Destino de los fondos
            </h1>
          </div>
        </div>

        {/* Recipient section */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="pt-4">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Cuéntanos quién recibirá lo recaudado
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Selecciona la persona o entidad encargada de recibir los fondos
                de tu campaña. Esto garantiza que el apoyo llegue a quien más lo
                necesita.
              </p>
            </div>
            <div className="space-y-4">
              <label className="block p-6 border-2 border-black rounded-lg hover:border-[#2c6e49] cursor-pointer bg-white">
                <div className="flex items-center space-x-4">
                  <Image
                    src="/views/create-campaign/yourself.svg"
                    alt="Tú mismo"
                    width={75}
                    height={75}
                  />
                  <div>
                    <div className="font-medium text-lg">Tú mismo</div>
                    <div className="text-base text-gray-600">
                      Recibes los fondos recaudados en tu campaña directamente
                      en tu cuenta bancaria.
                    </div>
                  </div>
                </div>
              </label>

              <label
                className="block p-6 border-2 border-black rounded-lg hover:border-[#2c6e49] cursor-pointer bg-white"
                onClick={() => setShowOtraPersonaModal(true)}
              >
                <div className="flex items-center space-x-4">
                  <Image
                    src="/views/create-campaign/other-person.svg"
                    alt="Otra persona"
                    width={75}
                    height={75}
                  />
                  <div>
                    <div className="font-medium text-lg">Otra persona</div>
                    <div className="text-base text-gray-600">
                      Designa a la persona que recibirá los fondos recaudados en
                      tu campaña.
                    </div>
                  </div>
                </div>
              </label>

              <label
                className="block p-6 border-2 border-black rounded-lg hover:border-[#2c6e49] cursor-pointer bg-white"
                onClick={() => setShowONGsModal(true)}
              >
                <div className="flex items-center space-x-4">
                  <Image
                    src="/views/create-campaign/organization.svg"
                    alt="Organización sin fines de lucro"
                    width={75}
                    height={75}
                  />
                  <div>
                    <div className="font-medium text-lg">
                      Organización sin fines de lucro
                    </div>
                    <div className="text-base text-gray-600">
                      Elige la organización, previamente autenticada en Minka,
                      que recibirá los fondos recaudados.
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Preview Section - Full Width */}
        <div className="bg-[#478C5C] w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] pt-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-start justify-between gap-12 relative">
              <div className="max-w-xl py-8">
                <h2 className="text-[42px] font-bold text-white">
                  ¡Ya está todo listo!
                </h2>
                <h2 className="text-[42px] font-bold text-white mb-4">
                  Revisa cómo quedó
                </h2>
                <p className="text-lg text-white/90 mb-6">
                  Antes de publicar tu campaña, verifica que todo esté correcto.
                  Puedes ver cómo lucirá en Minka.
                </p>
                <Button
                  variant="outline"
                  className="bg-white text-[#478C5C] border-white hover:bg-white/90 flex items-center gap-2 px-8 py-2 rounded-full"
                >
                  <span>Vista previa</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 5.25C4.5 5.25 1.5 12 1.5 12C1.5 12 4.5 18.75 12 18.75C19.5 18.75 22.5 12 22.5 12C22.5 12 19.5 5.25 12 5.25Z"
                      stroke="#478C5C"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92893 14.0711 8.25 12 8.25C9.92893 8.25 8.25 9.92893 8.25 12C8.25 14.0711 9.92893 15.75 12 15.75Z"
                      stroke="#478C5C"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
              </div>
              <div className="flex-1 flex justify-end items-end">
                <Image
                  src="/views/create-campaign/all-ready.svg"
                  alt="Campaign Preview"
                  width={502}
                  height={350}
                  className="w-full max-w-[502px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Verification Section */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-start justify-between gap-16">
              <div className="max-w-md">
                <h2 className="text-4xl font-bold mb-4">Verifica tu campaña</h2>
                <p className="text-lg text-gray-600">
                  La verificación asegura la transparencia de tu campaña, te
                  ayuda a generar confianza en los donantes y a destacar.{" "}
                  <span className="font-bold">
                    ¡Te recomendamos no saltarte este paso!
                  </span>
                </p>
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-xl border border-black p-8">
                  <div className="flex justify-center mb-4">
                    <Image
                      src="/views/create-campaign/verified.svg"
                      alt="Verificación"
                      width={64}
                      height={64}
                    />
                  </div>
                  <h3 className="text-xl font-medium mb-2 text-center">
                    Mejora tu campaña
                  </h3>
                  <p className="text-gray-600 mb-6 text-center">
                    Puedes verificar tu campaña para destacarla y generar
                    confianza, o publicarla directamente para empezar a recibir
                    apoyo.
                  </p>
                  <div className="w-full h-px bg-gray-200 my-6"></div>
                  <div className="space-y-3">
                    <Link href="/campaign-verification" className="block">
                      <Button className="w-full bg-[#478C5C] hover:bg-[#3a7049] text-white rounded-full py-4 flex items-center justify-center gap-2">
                        <span>Solicitar verificación</span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14 5L21 12M21 12L14 19M21 12H3"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full border-[#478C5C]/20 text-gray-600 rounded-full py-4 flex items-center justify-center gap-1"
                      onClick={handlePublish}
                    >
                      <span>Omitir y publicar</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 6L15 12L9 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white max-w-xl w-full mx-4 relative shadow-lg">
            {/* Cream-colored top bar with close button */}
            <div className="bg-[#f5f7e9] py-3 px-6 flex justify-end relative">
              <button
                onClick={closeSuccessModal}
                className="text-[#478C5C] hover:text-[#2c6e49]"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main content area */}
            <div className="p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="mb-6">
                  <Image
                    src="/views/create-campaign/handshake.svg"
                    alt="Éxito"
                    width={70}
                    height={70}
                  />
                </div>
                <h2 className="text-3xl font-bold mb-2">¡Felicidades!</h2>
                <h3 className="text-3xl font-bold mb-4">
                  Tu campaña ya está activa
                </h3>
                <p className="text-gray-600 text-lg">
                  Ahora puedes compartirla para empezar a recibir apoyo.
                </p>
              </div>

              <h4 className="text-xl font-bold mb-4 text-center">Compartir</h4>
              <div className="flex justify-center gap-8 mb-6">
                <a href="#" className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full border border-gray-300 flex items-center justify-center mb-1">
                    <Image
                      src="/social-media/url.svg"
                      alt="Copiar enlace"
                      width={22}
                      height={22}
                    />
                  </div>
                  <span className="text-sm">Copiar enlace</span>
                </a>

                <a href="#" className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full border border-gray-300 flex items-center justify-center mb-1">
                    <Image
                      src="/social-media/facebook.svg"
                      alt="Facebook"
                      width={22}
                      height={22}
                    />
                  </div>
                  <span className="text-sm">Facebook</span>
                </a>

                <a href="#" className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full border border-gray-300 flex items-center justify-center mb-1">
                    <Image
                      src="/social-media/whatsapp.svg"
                      alt="WhatsApp"
                      width={22}
                      height={22}
                    />
                  </div>
                  <span className="text-sm">WhatsApp</span>
                </a>

                <a href="#" className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full border border-gray-300 flex items-center justify-center mb-1">
                    <Image
                      src="/social-media/X.svg"
                      alt="X"
                      width={22}
                      height={22}
                    />
                  </div>
                  <span className="text-sm">X</span>
                </a>
              </div>
              <div className="border-t border-black my-3"></div>

              <div className="flex justify-center mt-6">
                <Button className="bg-[#478C5C] hover:bg-[#3a7049] text-white rounded-full py-2 px-8">
                  Ver mi campaña
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Otra Persona Modal */}
      {showOtraPersonaModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white max-w-xl w-full mx-4 relative shadow-lg">
            {/* Cream-colored top bar with close button */}
            <div className="bg-[#f5f7e9] py-3 px-6 flex justify-end relative">
              <button
                onClick={closeOtraPersonaModal}
                className="text-[#478C5C] hover:text-[#2c6e49]"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main content area */}
            <div className="p-8">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold">
                  Elige al beneficiario de tu campaña
                </h2>
                <p className="text-gray-600 mt-2">
                  Designa a la persona que recibirá los fondos recaudados en tu
                  campaña. Asegúrate de que su información sea correcta para
                  garantizar una entrega segura.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Banco
                  </label>
                  <div className="relative">
                    <select className="flex h-11 w-full rounded-md border border-black bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#478C5C] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm appearance-none">
                      <option value="">Banco Economico</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Número de cuenta
                  </label>
                  <input
                    type="text"
                    placeholder="Ingresa el número de cuenta bancaria"
                    className="flex h-11 w-full rounded-md border border-black bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#478C5C] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Documento de identidad
                  </label>
                  <div className="flex">
                    <div className="flex items-center h-11 px-3 border border-black border-r-0 rounded-l-md bg-white">
                      <div className="flex items-center">
                        <span className="inline-block mr-2">🇧🇴</span>
                        <span>BO</span>
                      </div>
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Ingresa el número de tu DNI"
                      className="flex-1 h-11 rounded-l-none rounded-r-md border border-black bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#478C5C] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nombre del titular de la cuenta
                  </label>
                  <input
                    type="text"
                    placeholder="Ingresa el nombre del beneficiario"
                    className="flex h-11 w-full rounded-md border border-black bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#478C5C] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Teléfono
                  </label>
                  <div className="flex">
                    <div className="flex items-center h-11 px-3 border border-black border-r-0 rounded-l-md bg-white">
                      <div className="flex items-center">
                        <span className="inline-block mr-2">🇧🇴</span>
                        <span>BO</span>
                      </div>
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Número de teléfono"
                      className="flex-1 h-11 rounded-l-none rounded-r-md border border-black bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#478C5C] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button className="bg-[#478C5C] hover:bg-[#3a7049] text-white rounded-full py-2 px-8">
                  Continuar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ONGs Modal */}
      {showONGsModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white max-w-xl w-full mx-4 relative shadow-lg">
            {/* Cream-colored top bar with close button */}
            <div className="bg-[#f5f7e9] py-3 px-6 flex justify-end relative">
              <button
                onClick={closeONGsModal}
                className="text-[#478C5C] hover:text-[#2c6e49]"
              >
                <X size={24} />
              </button>
            </div>

            {/* Main content area */}
            <div className="p-8">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold">
                  Organizaciones autenticadas en Minka
                </h2>
                <p className="text-gray-600 mt-2">
                  Las siguientes son organizaciones autenticadas y
                  pre-registradas en Minka. Selecciona a cuál de ellas quieres
                  enviar lo recaudado en tu campaña
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Organización sin fines de lucro
                </label>
                <div className="relative">
                  <select className="flex h-11 w-full rounded-md border border-black bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#478C5C] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm appearance-none">
                    <option value="">Selecciona la ONGs</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button className="bg-[#478C5C] hover:bg-[#3a7049] text-white rounded-full py-2 px-8">
                  Continuar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
