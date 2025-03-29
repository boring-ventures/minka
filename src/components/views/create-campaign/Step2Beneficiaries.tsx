"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useCampaignForm } from "@/components/providers/campaign-form-provider";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const formSchema = z.object({
  beneficiariesDescription: z
    .string()
    .min(10, {
      message: "La descripción debe tener al menos 10 caracteres",
    })
    .max(500, {
      message: "La descripción no puede tener más de 500 caracteres",
    }),
});

export function Step2Beneficiaries() {
  const { state, dispatch, nextStep, prevStep, saveDraft } = useCampaignForm();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      beneficiariesDescription: state.beneficiariesDescription,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    dispatch({
      type: "SET_BENEFICIARIES_DESCRIPTION",
      payload: values.beneficiariesDescription,
    });

    await saveDraft();
    nextStep();
  };

  if (state.isSubmitting) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" showText text="Guardando..." />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-16">
        {/* Beneficiaries Description */}
        <div className="py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="pt-4">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Describe los beneficiarios
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Explica quiénes serán los beneficiarios de tu campaña y cómo
                utilizarás los fondos recaudados para ayudarlos. Sé transparente
                y específico sobre el impacto que esperas lograr.
              </p>
            </div>
            <div className="bg-white rounded-xl border border-black p-8">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="beneficiariesDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-medium">
                        Descripción de los beneficiarios
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe quiénes son los beneficiarios y cómo utilizarás los fondos para ayudarlos"
                          rows={8}
                          className="w-full rounded-lg border border-black bg-white shadow-sm focus:border-[#478C5C] focus:ring-[#478C5C] focus:ring-0 p-4"
                          {...field}
                          maxLength={500}
                        />
                      </FormControl>
                      <div className="text-sm text-gray-500 text-right mt-1">
                        {field.value?.length || 0}/500
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            onClick={prevStep}
            variant="outline"
            className="border-[#2c6e49] text-[#2c6e49] px-6 py-2 rounded-full text-lg flex items-center"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Anterior
          </Button>
          <Button
            type="submit"
            className="bg-[#2c6e49] hover:bg-[#1e4d33] text-white px-12 py-6 rounded-full text-xl"
          >
            Continuar
          </Button>
        </div>
      </form>
    </Form>
  );
}
