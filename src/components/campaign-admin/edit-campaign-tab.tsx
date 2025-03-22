"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

interface EditCampaignTabProps {
  campaign: any;
}

export function EditCampaignTab({ campaign }: EditCampaignTabProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: campaign.title || "",
    description: campaign.description || "",
    goal_amount: campaign.goal_amount || 0,
    location: campaign.location || "",
    category_id: campaign.category_id || "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      const supabase = createClientComponentClient();

      const { error } = await supabase
        .from("campaigns")
        .update({
          title: formData.title,
          description: formData.description,
          goal_amount: formData.goal_amount,
          location: formData.location,
          category_id: formData.category_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", campaign.id);

      if (error) throw error;

      toast({
        title: "Campaña actualizada",
        description: "Los cambios han sido guardados correctamente.",
      });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Información de la campaña</h2>
        <p className="text-sm text-gray-500">
          Modifica los detalles de tu campaña para mejorar su alcance e impacto
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
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
              required
            />
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
              required
            />
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

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ubicación de la campaña
            </label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="¿Dónde tendrá lugar la campaña?"
              className="w-full border-gray-300"
            />
            <p className="text-xs text-gray-500 mt-1">Campo opcional</p>
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
                <Button
                  type="button"
                  variant="outline"
                  className="bg-white border-gray-300"
                >
                  Seleccionar
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="border-gray-300"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white"
            disabled={isLoading}
          >
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
