"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface CampaignUpdate {
  id: string;
  campaign_id: string;
  title: string;
  message: string;
  youtube_url?: string;
  created_at: string;
}

interface AdsTabProps {
  campaign: Record<string, any>;
}

export function AdsTab({ campaign }: AdsTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveBar, setShowSaveBar] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const initialFormState = {
    title: "",
    message: "",
    youtube_url: "",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [updates, setUpdates] = useState<CampaignUpdate[]>(() => {
    // Provide dummy data in development mode
    if (process.env.NODE_ENV === "development") {
      return [
        {
          id: "1",
          campaign_id: campaign.id,
          title: "¡Hemos alcanzado el 40% de nuestra meta!",
          message:
            "¡Hemos alcanzado el 40% de nuestra meta! Gracias a todos por su apoyo continuo.",
          created_at: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(), // 3 days ago
        },
        {
          id: "2",
          campaign_id: campaign.id,
          title: "Jornada de limpieza en el Parque Amboró",
          message:
            "Acabamos de organizar una jornada de limpieza en el Parque Amboró. ¡Gracias a los 25 voluntarios que participaron!",
          created_at: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(), // 7 days ago
        },
      ];
    }
    return [];
  });

  useEffect(() => {
    // Check if form has any changes
    const formChanged =
      formData.title.trim() !== "" ||
      formData.message.trim() !== "" ||
      formData.youtube_url.trim() !== "";

    setHasChanges(formChanged);
    setShowSaveBar(formChanged);
  }, [formData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Campos requeridos",
        description: "El título y el mensaje son campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from("campaign_updates")
        .insert({
          campaign_id: campaign.id,
          title: formData.title,
          message: formData.message,
          youtube_url: formData.youtube_url,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      // Add the new update to the list
      if (data) {
        setUpdates([data[0], ...updates]);
      }

      // Clear the form
      setFormData(initialFormState);
      setShowSaveBar(false);
      setHasChanges(false);

      toast({
        title: "Anuncio publicado",
        description: "Tu actualización ha sido publicada correctamente.",
      });
    } catch (error) {
      console.error("Error publishing update:", error);
      toast({
        title: "Error",
        description:
          "No se pudo publicar la actualización. Intenta nuevamente.",
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
      <div>
        <h2 className="text-2xl font-bold mb-2">Publicar anuncios</h2>
        <p className="text-gray-600 mb-6">
          Comparte actualizaciones sobre el progreso de tu campaña, agradece a
          los donadores o motiva publicando anuncios en tiempo real.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Título del anuncio
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Ingresa el título de tu anuncio"
            className="w-full rounded-md border border-gray-300 p-3"
            maxLength={60}
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {formData.title.length}/60
          </div>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Texto del anuncio
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Ejemplo: Su conservación depende de nosotros"
            className="w-full rounded-md border border-gray-300 p-3 min-h-[120px]"
            maxLength={130}
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {formData.message.length}/130
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-medium mb-4">
            Añade fotos o videos a tu anuncio (opcional)
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Esto ayudará a entender mejor tu anuncio
          </p>

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
            <input
              type="text"
              id="youtube_url"
              name="youtube_url"
              value={formData.youtube_url}
              onChange={handleInputChange}
              placeholder="Enlace de YouTube"
              className="w-full rounded-md border border-gray-300 p-3 pl-10"
            />
          </div>
        </div>
      </div>

      {/* Previous Updates */}
      <div className="space-y-6 pt-6">
        <h3 className="font-medium text-gray-900">Anuncios recientes</h3>

        {updates.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {updates.map((update) => (
              <div key={update.id} className="py-4">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-[#e8f0e9] flex items-center justify-center text-[#2c6e49] font-bold">
                      {campaign.title?.charAt(0) || "C"}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {update.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(update.created_at).toLocaleDateString()}
                    </p>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>{update.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay anuncios aún
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Comparte novedades sobre tu campaña para mantener informados a los
              donadores.
            </p>
          </div>
        )}
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
            disabled={isLoading || !hasChanges}
            onClick={handleSubmit}
          >
            {isLoading ? "Publicando..." : "Guardar cambios"}
          </Button>
        </div>
      )}
    </div>
  );
}
