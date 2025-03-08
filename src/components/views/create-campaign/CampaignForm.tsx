"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, User, Users, Building2 } from "lucide-react"

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
  })

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Update all input backgrounds to white */}
        <style jsx global>{`
          input, textarea, select, .bg-card {
            background-color: white !important;
          }
        `}</style>

        {/* Campaign Name */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="pt-4">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Nombre de la campaña</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Dale un nombre claro a tu campaña y agrega una breve explicación o detalle para transmitir rápidamente
                su esencia y objetivo.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-[#478C5C]/20 p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-medium mb-2">Nombre de la campaña</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ingresa el nombre de tu campaña"
                      className="w-full rounded-lg border-2 border-[#478C5C]/20 bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] h-14 px-4"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      maxLength={80}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      {formData.name.length}/80
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium mb-2">Detalle</label>
                  <div className="relative">
                    <textarea
                      placeholder="Ejemplo: Su conservación depende de nosotros"
                      rows={4}
                      className="w-full rounded-lg border-2 border-[#478C5C]/20 bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] p-4"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      maxLength={150}
                    />
                    <div className="absolute right-4 bottom-4 text-sm text-gray-500">
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
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Selecciona una categoría</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Categoriza una categoría y tu campaña va ser encontrada más fácilmente por los donadores potenciales.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-[#478C5C]/20 p-8">
              <label className="block text-lg font-medium mb-2">Categoría</label>
              <select
                className="w-full rounded-lg border-2 border-[#478C5C]/20 bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] h-14 px-4"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Establece una meta de recaudación</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Define una meta realista que te ayude a alcanzar el objetivo de tu campaña.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-[#478C5C]/20 p-8">
              <div className="space-y-4">
                <label className="block text-lg font-medium mb-2">Meta de recaudación</label>
                <input
                  type="number"
                  placeholder="Ingresa el monto a recaudar"
                  className="w-full rounded-lg border-2 border-[#478C5C]/20 bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] h-14 px-4"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                />
                <label className="flex items-center space-x-3 mt-4">
                  <input
                    type="radio"
                    checked={formData.hasNoGoal}
                    onChange={() => setFormData({ ...formData, hasNoGoal: true })}
                    className="rounded-full border-[#2c6e49] text-[#2c6e49] focus:ring-[#2c6e49]"
                  />
                  <span className="text-base text-gray-600">Este será el monto objetivo de tu campaña</span>
                </label>
              </div>
            </div>
          </div>
          <div className="mt-16 border-b border-[#478C5C]/20" />
        </div>

        {/* Media Upload */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="pt-4">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Agrega fotos y videos que ilustren tu causa</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Imágenes poderosas que cuenten tu historia harán que tu campaña sea más personal y emotiva. Esto ayudará
                a inspirar y conectar con más personas que apoyen tu causa.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-[#478C5C]/20 p-8">
              <div className="space-y-6">
                <div className="border-2 border-dashed border-[#478C5C]/30 rounded-lg p-8 text-center bg-white">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="h-10 w-10 text-gray-400 mb-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm text-gray-500 mb-4">Arrastra o carga tus fotos aquí</p>
                    <p className="text-xs text-gray-400 mb-4">Sólo archivos en formato JPEG, PNG y máximo 2 MB</p>
                    <Button
                      variant="outline"
                      className="bg-[#2c6e49] text-white hover:bg-[#1e4d33] border-0 rounded-md"
                    >
                      Seleccionar
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <svg
                      className="h-5 w-5 text-gray-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm text-gray-500">Agregar videos de YouTube</span>
                  </div>
                  <input
                    type="text"
                    placeholder="URL de video de YouTube"
                    className="w-full rounded-lg border-2 border-[#478C5C]/20 bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] h-14 px-4"
                  />
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
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Señala la ubicación de tu campaña</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                ¿Dónde se desarrolla tu campaña? Agrega su ubicación.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-[#478C5C]/20 p-8">
              <label className="block text-lg font-medium mb-2">Ubicación de la campaña</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar ubicación"
                  className="w-full rounded-lg border-2 border-[#478C5C]/20 bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] pl-10 h-14 px-4"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-3">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300 text-[#2c6e49] focus:ring-[#2c6e49]" />
                  <span className="text-sm text-gray-600">Cargar ubicación actual</span>
                </label>
              </div>
            </div>
          </div>
          <div className="mt-16 border-b border-[#478C5C]/20" />
        </div>

        {/* Duration */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="pt-4">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Define el tiempo que durará tu campaña</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                ¿Hasta qué fecha deberá estar vigente tu campaña? Establece un tiempo de duración. Toma en cuenta que,
                una vez publicada tu campaña, no podrás modificar este plazo.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-[#478C5C]/20 p-8">
              <label className="block text-lg font-medium mb-2">Fecha de finalización</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="DD/MM/AAAA"
                  className="w-full rounded-lg border-2 border-[#478C5C]/20 bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] pl-10 h-14 px-4"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ahora sí: ¡Cuenta tu historia!</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Inspira a los demás compartiendo el propósito de tu proyecto. Sé claro y directo para que tu causa
                conecte de manera profunda con quienes pueden hacer la diferencia.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-[#478C5C]/20 p-8">
              <div className="relative">
                <label className="block text-lg font-medium mb-2">Presentación de la campaña</label>
                <textarea
                  rows={6}
                  placeholder="Ejemplo: Su conservación depende de nosotros"
                  className="w-full rounded-lg border-2 border-[#478C5C]/20 bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] p-4"
                  value={formData.story}
                  onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                  maxLength={600}
                />
                <div className="absolute right-4 bottom-4 text-sm text-gray-500">{formData.story.length}/600</div>
              </div>
            </div>
          </div>
          <div className="mt-16 border-b border-[#478C5C]/20" />
        </div>

        {/* Recipient section */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="pt-4">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Cuéntanos quién recibirá lo recaudado</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Selecciona la persona o entidad encargada de recibir los fondos de tu campaña. Esto garantiza que el
                apoyo llegue a quien más lo necesita.
              </p>
            </div>
            <div className="space-y-4">
              <label className="block p-6 border-2 border-[#478C5C]/20 rounded-lg hover:border-[#2c6e49] cursor-pointer bg-white">
                <div className="flex items-center space-x-4">
                  <User className="h-6 w-6 text-[#2c6e49]" />
                  <div>
                    <div className="font-medium text-lg">Tú mismo</div>
                    <div className="text-base text-gray-600">
                      Recibes los fondos recaudados en tu campaña directamente en tu cuenta bancaria.
                    </div>
                  </div>
                </div>
              </label>

              <label className="block p-6 border-2 border-[#478C5C]/20 rounded-lg hover:border-[#2c6e49] cursor-pointer bg-white">
                <div className="flex items-center space-x-4">
                  <Users className="h-6 w-6 text-[#2c6e49]" />
                  <div>
                    <div className="font-medium text-lg">Otra persona</div>
                    <div className="text-base text-gray-600">
                      Designa a la persona que recibirá los fondos recaudados en tu campaña.
                    </div>
                  </div>
                </div>
              </label>

              <label className="block p-6 border-2 border-[#478C5C]/20 rounded-lg hover:border-[#2c6e49] cursor-pointer bg-white">
                <div className="flex items-center space-x-4">
                  <Building2 className="h-6 w-6 text-[#2c6e49]" />
                  <div>
                    <div className="font-medium text-lg">Organización sin fines de lucro</div>
                    <div className="text-base text-gray-600">
                      Elige la organización, previamente autenticada en Minka, que recibirá los fondos recaudados.
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Preview Section - Full Width */}
        <div className="bg-[#2c6e49] w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between gap-12">
              <div className="max-w-xl">
                <h2 className="text-4xl font-bold text-white mb-4">¡Ya está todo listo!</h2>
                <p className="text-lg text-white/90 mb-8">
                  Antes de publicar tu campaña, verifica que todo esté correcto. Puedes ver cómo lucirá en Minka.
                </p>
                <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                  Vista previa
                </Button>
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-lg border-2 border-white/20 p-8">
                  <div className="aspect-video bg-gray-100 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Section */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-start justify-between gap-12">
              <div className="max-w-xl">
                <h2 className="text-4xl font-bold mb-4">Verifica tu campaña</h2>
                <p className="text-lg text-gray-600">
                  La verificación asegura la transparencia de tu campaña, te ayuda a generar confianza en los donadores
                  y a destacar. ¡Te recomendamos no saltarte este paso!
                </p>
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-xl border border-[#478C5C]/20 p-8 text-center">
                  <div className="inline-block p-4 rounded-full bg-[#f5f7e9] mb-4">
                    <svg className="w-8 h-8 text-[#2c6e49]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium mb-2">Mejora tu campaña</h3>
                  <p className="text-gray-600 mb-6">
                    Puedes verificar tu campaña para demostrar y generar confianza, aumentando las posibilidades de
                    recaudar fondos.
                  </p>
                  <div className="space-y-3">
                    <Button className="w-full bg-[#2c6e49] hover:bg-[#1e4d33] text-white rounded-full py-4">
                      Solicitar verificación
                    </Button>
                    <Button variant="outline" className="w-full border-[#478C5C]/20 text-gray-600 rounded-full py-4">
                      Omitir y publicar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

