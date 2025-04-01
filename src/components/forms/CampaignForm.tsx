import React, { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

export function CampaignForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // ... existing form data state
  });

  const handleRecipientSelect = async (recipient: Recipient) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Create campaign with recipient
      const response = await fetch("/api/campaign/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          recipient: recipient.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create campaign");
      }

      const { campaignId } = await response.json();

      // Update campaign status to pending_verification
      const updateResponse = await fetch(`/api/campaign/${campaignId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "pending_verification",
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || "Failed to update campaign status");
      }

      // Show success message
      toast({
        title: "¡Éxito!",
        description: "Campaña creada exitosamente",
      });

      // Redirect to campaign page
      router.push(`/campaigns/${campaignId}`);
    } catch (error) {
      console.error("Error creating campaign:", error);
      setError(
        error instanceof Error ? error.message : "Error al crear la campaña"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... rest of the component code ...
}
