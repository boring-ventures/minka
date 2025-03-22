"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

interface EditCampaignTabProps {
  campaign: Record<string, any>;
}

export function EditCampaignTab({ campaign }: EditCampaignTabProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveBar, setShowSaveBar] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const initialFormState = useMemo(
    () => ({
      title: campaign.title || "",
      description: campaign.description || "",
      goal_amount: campaign.goal_amount || 0,
      location: campaign.location || "",
      category_id: campaign.category_id || "",
      youtube_url: campaign.youtube_url || "",
      presentation: campaign.presentation || "",
      end_date: campaign.end_date || "",
    }),
    [campaign]
  );

  const [formData, setFormData] = useState(initialFormState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if form has any changes
    const formChanged =
      JSON.stringify(formData) !== JSON.stringify(initialFormState);
    setHasChanges(formChanged);
    setShowSaveBar(formChanged);
  }, [formData, initialFormState]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle file upload logic here
    const files = e.target.files;
    if (files && files.length > 0) {
      // You would normally upload the file here
      toast({
        title: "Archivo seleccionado",
        description: `Archivo ${files[0].name} seleccionado.`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClientComponentClient();

      const { error } = await supabase
        .from("campaigns")
        .update({
          title: formData.title,
          description: formData.description,
          goal_amount: formData.goal_amount,
          location: formData.location,
          category_id: formData.category_id,
          youtube_url: formData.youtube_url,
          presentation: formData.presentation,
          end_date: formData.end_date,
          updated_at: new Date().toISOString(),
        })
        .eq("id", campaign.id);

      if (error) throw error;

      toast({
        title: "Campaña actualizada",
        description: "Los cambios han sido guardados correctamente.",
      });

      setShowSaveBar(false);
      setHasChanges(false);
      router.refresh();
    } catch (error) {
      console.error("Error updating campaign:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la campaña. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormState);
    setShowSaveBar(false);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Información de la campaña</h2>
        <p className="text-sm text-gray-500">
          Modifica los detalles de tu campaña para mejorar su alcance e impacto
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre de la campaña
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ingresa el nombre de tu campaña"
              className="w-full border-gray-300"
              maxLength={60}
              required
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.title.length}/60
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Detalle
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Ejemplo: Su conservación depende de nosotros"
              className="w-full rounded-md border border-gray-300 p-3 min-h-[100px]"
              maxLength={130}
              required
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.description.length}/130
            </div>
          </div>

          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Categoría
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 p-3"
              required
            >
              <option value="">Selecciona una categoría</option>
              <option value="1">Salud</option>
              <option value="2">Educación</option>
              <option value="3">Medio ambiente</option>
              <option value="4">Comunidad</option>
              <option value="5">Animales</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="goal_amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Meta de recaudación
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                Bs.
              </span>
              <Input
                id="goal_amount"
                name="goal_amount"
                type="number"
                value={formData.goal_amount}
                onChange={handleInputChange}
                className="pl-10 w-full border-gray-300"
                required
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-medium mb-4">Imagen de la campaña</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <PlusCircle className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-2">
                  Arrastra o carga tus fotos aquí
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Deben ser archivos JPG o PNG, no mayor a 2 MB.
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="bg-white border-gray-300"
                  onClick={handleFileSelect}
                >
                  Seleccionar
                </Button>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="youtube_url"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Agregar enlace de YouTube
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 9L15 12L10 15V9Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <Input
                id="youtube_url"
                name="youtube_url"
                value={formData.youtube_url}
                onChange={handleInputChange}
                placeholder="Enlace de YouTube"
                className="pl-10 w-full border-gray-300"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ubicación de la campaña
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 21C13.6569 21 15 19.6569 15 18C15 16.3431 13.6569 15 12 15C10.3431 15 9 16.3431 9 18C9 19.6569 10.3431 21 12 21Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 15V2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 6L12 2L16 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="¿Dónde tendrá lugar la campaña?"
                className="pl-10 w-full border-gray-300"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Campo opcional</p>
          </div>

          <div>
            <label
              htmlFor="end_date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha de finalización
            </label>
            <Input
              id="end_date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleInputChange}
              className="w-full border-gray-300"
              required
            />
          </div>

          <div>
            <label
              htmlFor="presentation"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Presentación de la campaña
            </label>
            <textarea
              id="presentation"
              name="presentation"
              value={formData.presentation}
              onChange={handleInputChange}
              placeholder="Ejemplo: Su conservación depende de nosotros"
              className="w-full rounded-md border border-gray-300 p-3 min-h-[150px]"
              maxLength={500}
              required
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.presentation.length}/500
            </div>
          </div>
        </div>
      </form>

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
            disabled={isLoading || !hasChanges}
            onClick={handleSubmit}
          >
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      )}
    </div>
  );
}
