"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PlusCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface AdsTabProps {
  campaign: any;
}

export function AdsTab({ campaign }: AdsTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    message: "",
  });
  const [updates, setUpdates] = useState<any[]>(() => {
    // Provide dummy data in development mode
    if (process.env.NODE_ENV === "development") {
      return [
        {
          id: "1",
          campaign_id: campaign.id,
          message:
            "¡Hemos alcanzado el 40% de nuestra meta! Gracias a todos por su apoyo continuo.",
          created_at: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(), // 3 days ago
        },
        {
          id: "2",
          campaign_id: campaign.id,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    setIsLoading(true);

    try {
      const supabase = createClientComponentClient();

      const { data, error } = await supabase
        .from("campaign_updates")
        .insert({
          campaign_id: campaign.id,
          message: formData.message,
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) throw error;

      // Add the new update to the list
      if (data) {
        setUpdates([data[0], ...updates]);
      }

      // Clear the form
      setFormData({ message: "" });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Publicar anuncios</h2>
        <p className="text-sm text-gray-500">
          Comparte actualizaciones sobre el progreso de tu campaña, agradece a
          los donadores o motiva publicando anuncios en tiempo real.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="p-4">
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Comparte actualizaciones sobre tu campaña..."
              className="w-full min-h-[120px] resize-none border-0 bg-transparent p-0 focus:ring-0 text-base"
              required
            />
          </div>
          <div className="border-t border-gray-100 p-3 flex justify-between items-center">
            <div className="flex items-center">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 rounded-full p-2 hover:bg-gray-50"
              >
                <PlusCircle className="h-5 w-5" />
                <span className="sr-only">Adjuntar imagen</span>
              </button>
            </div>
            <Button
              type="submit"
              className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white flex items-center gap-2"
              disabled={isLoading || !formData.message.trim()}
            >
              <Send className="h-4 w-4" />
              Publicar
            </Button>
          </div>
        </div>
      </form>

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
                      {campaign.title}
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
    </div>
  );
}
