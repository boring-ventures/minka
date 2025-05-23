"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import { Mail, Calendar, ChevronDown, Info, Eye, EyeOff } from "lucide-react";
import { signInWithSocial } from "@/lib/supabase-auth";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Improved validation schema with better error messages
const signUpFormSchema = z
  .object({
    firstName: z.string().min(1, "El nombre es requerido"),
    lastName: z.string().min(1, "Los apellidos son requeridos"),
    documentId: z.string().min(1, "El número de DNI es requerido"),
    birthDate: z.date({
      required_error: "La fecha de nacimiento es requerida",
      invalid_type_error: "La fecha debe ser válida",
    }),
    email: z
      .string()
      .min(1, "El correo electrónico es requerido")
      .email("Ingresa un correo electrónico válido"),
    phone: z
      .string()
      .min(1, "El número de teléfono es requerido")
      .regex(/^\d+$/, "El número de teléfono debe contener solo dígitos"),
    password: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(
        /[A-Z]/,
        "La contraseña debe contener al menos una letra mayúscula"
      )
      .regex(
        /[a-z]/,
        "La contraseña debe contener al menos una letra minúscula"
      )
      .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar los términos y condiciones",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpFormSchema>;

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setError,
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      documentId: "",
      birthDate: undefined,
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  async function onSubmit(data: SignUpFormData) {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setIsSubmitting(true);

      // Format the date to YYYY-MM-DD or DD/MM/YYYY as needed by your API
      const formattedBirthDate = format(data.birthDate, "dd/MM/yyyy");

      await signUp({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        documentId: data.documentId,
        birthDate: formattedBirthDate,
        phone: data.phone,
      });

      // Note: Success toast and redirection are now handled in the auth provider
      reset();
    } catch (error) {
      console.error("Error during sign up:", error);

      // Use toast notification for errors instead of field errors
      toast({
        title: "Error",
        description:
          "No se pudo crear la cuenta. Por favor, verifica tus datos e intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  }

  async function handleSocialSignIn(provider: "google" | "facebook" | "apple") {
    if (socialLoading) return;

    try {
      setSocialLoading(provider);
      await signInWithSocial(provider);
      // The redirect will be handled by Supabase
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      toast({
        title: "Error",
        description: `No se pudo iniciar sesión con ${provider}.`,
        variant: "destructive",
      });
    } finally {
      setSocialLoading(null);
    }
  }

  if (isLoading || socialLoading || isSubmitting) {
    return <LoadingScreen />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* First Name */}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium mb-2">
          Nombres
        </label>
        <div className="relative">
          <Input
            id="firstName"
            {...register("firstName")}
            placeholder="Ingresa tu nombre"
            className="w-full border-black"
            aria-invalid={errors.firstName ? "true" : "false"}
            disabled={isLoading || isSubmitting}
          />
        </div>
        {errors.firstName && (
          <p className="text-sm text-red-500 mt-1 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            {errors.firstName.message}
          </p>
        )}
      </div>

      {/* Last Name */}
      <div>
        <label htmlFor="lastName" className="block text-sm font-medium mb-2">
          Apellidos
        </label>
        <div className="relative">
          <Input
            id="lastName"
            {...register("lastName")}
            placeholder="Ingresa tus apellidos"
            className="w-full border-black"
            aria-invalid={errors.lastName ? "true" : "false"}
            disabled={isLoading || isSubmitting}
          />
        </div>
        {errors.lastName && (
          <p className="text-sm text-red-500 mt-1 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            {errors.lastName.message}
          </p>
        )}
      </div>

      {/* Document ID */}
      <div>
        <label htmlFor="documentId" className="block text-sm font-medium mb-2">
          Documento de Identidad
        </label>
        <div className="flex">
          <div className="relative">
            <button
              type="button"
              className="flex items-center justify-between h-10 px-3 border border-black border-r-0 rounded-l-md bg-white text-sm"
              disabled={isLoading || isSubmitting}
            >
              <div className="flex items-center">
                <span className="mr-2">🇧🇴</span>
                <span>BO</span>
              </div>
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>
          </div>
          <Input
            id="documentId"
            {...register("documentId")}
            placeholder="Ingresa el número de tu DNI"
            className="flex-1 rounded-l-none border-black"
            aria-invalid={errors.documentId ? "true" : "false"}
            disabled={isLoading || isSubmitting}
          />
        </div>
        {errors.documentId && (
          <p className="text-sm text-red-500 mt-1 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            {errors.documentId.message}
          </p>
        )}
      </div>

      {/* Birth Date */}
      <div>
        <label htmlFor="birthDate" className="block text-sm font-medium mb-2">
          Fecha de nacimiento
        </label>
        <Controller
          control={control}
          name="birthDate"
          render={({ field }) => (
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="birthDate"
                    type="button"
                    variant={"outline"}
                    className={cn(
                      "w-full h-10 justify-start text-left relative pl-10 border-black rounded-md bg-white hover:bg-gray-50",
                      !field.value && "text-gray-400",
                      errors.birthDate && "border-red-500"
                    )}
                    disabled={isLoading || isSubmitting}
                  >
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    {field.value
                      ? format(field.value, "dd/MM/yyyy", { locale: es })
                      : "DD/MM/AAAA"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-white border border-gray-200 rounded-lg shadow-lg"
                  align="start"
                >
                  <CalendarComponent
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      // Auto-close the popover after selection
                      setTimeout(() => document.body.click(), 100);
                    }}
                    disabled={(date) => {
                      // Disable future dates and dates more than 100 years ago
                      const hundredYearsAgo = new Date();
                      hundredYearsAgo.setFullYear(
                        hundredYearsAgo.getFullYear() - 100
                      );
                      return date > new Date() || date < hundredYearsAgo;
                    }}
                    captionLayout="dropdown"
                    fromYear={new Date().getFullYear() - 100}
                    toYear={new Date().getFullYear()}
                    initialFocus
                    className="rounded-md border-none p-3"
                    classNames={{
                      caption_dropdowns: "flex gap-1",
                      dropdown:
                        "p-1 bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#2c6e49]",
                      caption_label: "text-sm font-medium hidden",
                      nav_button:
                        "h-8 w-8 bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-full",
                      day_selected:
                        "bg-[#2c6e49] text-white hover:bg-[#2c6e49] hover:text-white focus:bg-[#2c6e49] focus:text-white",
                      day_today: "bg-gray-100 text-gray-900",
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        />
        {errors.birthDate && (
          <p className="text-sm text-red-500 mt-1 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            {errors.birthDate.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Correo electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="correo@ejemplo.com"
            className="pl-10 border-black"
            aria-invalid={errors.email ? "true" : "false"}
            disabled={isLoading || isSubmitting}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-500 mt-1 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-2">
          Teléfono
        </label>
        <div className="flex">
          <div className="relative">
            <button
              type="button"
              className="flex items-center justify-between h-10 px-3 border border-black border-r-0 rounded-l-md bg-white text-sm"
              disabled={isLoading || isSubmitting}
            >
              <div className="flex items-center">
                <span className="mr-2">🇧🇴</span>
                <span>+591</span>
              </div>
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>
          </div>
          <Input
            id="phone"
            type="tel"
            {...register("phone")}
            placeholder="XXXXXXXX"
            className="flex-1 rounded-l-none border-black"
            aria-invalid={errors.phone ? "true" : "false"}
            disabled={isLoading || isSubmitting}
          />
        </div>
        {errors.phone && (
          <p className="text-sm text-red-500 mt-1 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          Contraseña
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            placeholder="••••••••"
            className="border-black pr-10"
            aria-invalid={errors.password ? "true" : "false"}
            disabled={isLoading || isSubmitting}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-red-500 mt-1 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium mb-2"
        >
          Confirmar contraseña
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword")}
            placeholder="••••••••"
            className="border-black pr-10"
            aria-invalid={errors.confirmPassword ? "true" : "false"}
            disabled={isLoading || isSubmitting}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-red-500 mt-1 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Accept Terms */}
      <div className="flex items-center space-x-2">
        <Controller
          name="acceptTerms"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="terms"
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={isLoading || isSubmitting}
            />
          )}
        />
        <label htmlFor="terms" className="text-sm leading-none cursor-pointer">
          Acepto los{" "}
          <Link href="/terminos" className="text-[#2c6e49] hover:underline">
            Términos, Condiciones y Políticas de Minka
          </Link>
          .
        </label>
      </div>
      {errors.acceptTerms && (
        <p className="text-sm text-red-500 mt-1 flex items-center">
          <Info className="h-3 w-3 mr-1" />
          {errors.acceptTerms.message}
        </p>
      )}

      <Button
        type="submit"
        className="w-full bg-[#2c6e49] hover:bg-[#1e4d33] text-white font-medium py-2 rounded-full"
        disabled={isLoading || isSubmitting}
      >
        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-gray-300 flex-grow" />
        <span className="mx-4 text-sm text-gray-500">Regístrate con</span>
        <div className="border-t border-gray-300 flex-grow" />
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-3 gap-4">
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center border border-black rounded-md h-11"
          onClick={() => handleSocialSignIn("facebook")}
          disabled={!!socialLoading || isLoading || isSubmitting}
        >
          <Image
            src="/social-icons/Facebook.svg"
            alt="Facebook"
            width={20}
            height={20}
          />
          <span className="ml-2">
            {socialLoading === "facebook" ? "Cargando..." : "Facebook"}
          </span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center border border-black rounded-md h-11"
          onClick={() => handleSocialSignIn("google")}
          disabled={!!socialLoading || isLoading || isSubmitting}
        >
          <Image
            src="/social-icons/Google.svg"
            alt="Google"
            width={20}
            height={20}
          />
          <span className="ml-2">
            {socialLoading === "google" ? "Cargando..." : "Google"}
          </span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center border border-black rounded-md h-11"
          onClick={() => handleSocialSignIn("apple")}
          disabled={!!socialLoading || isLoading || isSubmitting}
        >
          <Image
            src="/social-icons/Apple.svg"
            alt="Apple"
            width={20}
            height={20}
          />
          <span className="ml-2">
            {socialLoading === "apple" ? "Cargando..." : "Apple"}
          </span>
        </Button>
      </div>
    </form>
  );
}
