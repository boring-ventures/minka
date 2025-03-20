"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { z } from "zod";
import { Facebook, Mail, Calendar, ChevronDown, Apple } from "lucide-react";
import { signInWithSocial } from "@/lib/supabase-auth";

const signUpFormSchema = z
  .object({
    firstName: z.string().min(1, "El nombre es requerido"),
    lastName: z.string().min(1, "Los apellidos son requeridos"),
    documentId: z.string().min(1, "El número de DNI es requerido"),
    birthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
    email: z.string().email("Ingresa un correo electrónico válido"),
    phone: z.string().min(1, "El número de teléfono es requerido"),
    password: z
      .string()
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
  const { signUp } = useAuth();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      documentId: "",
      birthDate: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  async function onSubmit(data: SignUpFormData) {
    try {
      setIsLoading(true);

      await signUp({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        documentId: data.documentId,
        birthDate: data.birthDate,
        phone: data.phone,
      });

      toast({
        title: "Éxito",
        description:
          "Tu cuenta ha sido creada correctamente. Por favor, verifica tu correo electrónico.",
      });
    } catch (error) {
      console.error("Error during sign up:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo crear la cuenta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSocialSignIn(provider: "google" | "facebook" | "apple") {
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
      setSocialLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* First Name */}
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium mb-2">
          Nombres
        </label>
        <div className="relative">
          <Input
            id="firstName"
            {...form.register("firstName")}
            placeholder="Ingresa tu nombre"
            className="w-full"
          />
        </div>
        {form.formState.errors.firstName && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.firstName.message}
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
            {...form.register("lastName")}
            placeholder="Ingresa tus apellidos"
            className="w-full"
          />
        </div>
        {form.formState.errors.lastName && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.lastName.message}
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
              className="flex items-center justify-between h-11 px-3 border border-black border-r-0 rounded-l-md bg-white text-sm"
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
            {...form.register("documentId")}
            placeholder="Ingresa el número de tu DNI"
            className="flex-1 rounded-l-none"
          />
        </div>
        {form.formState.errors.documentId && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.documentId.message}
          </p>
        )}
      </div>

      {/* Birth Date */}
      <div>
        <label htmlFor="birthDate" className="block text-sm font-medium mb-2">
          Fecha de nacimiento
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="birthDate"
            type="text"
            {...form.register("birthDate")}
            placeholder="DD/MM/AAAA"
            className="pl-10"
          />
        </div>
        {form.formState.errors.birthDate && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.birthDate.message}
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
            {...form.register("email")}
            placeholder="tucorreo@dominio.com"
            className="pl-10"
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.email.message}
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
              className="flex items-center justify-between h-11 px-3 border border-black border-r-0 rounded-l-md bg-white text-sm"
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
            {...form.register("phone")}
            placeholder="Ingresa tu número de teléfono"
            className="flex-1 rounded-l-none"
          />
        </div>
        {form.formState.errors.phone && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.phone.message}
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
            type="password"
            {...form.register("password")}
            placeholder="Ingresa tu contraseña"
            className="w-full"
          />
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.password.message}
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
            type="password"
            {...form.register("confirmPassword")}
            placeholder="Confirma tu contraseña"
            className="w-full"
          />
        </div>
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" {...form.register("acceptTerms")} />
        <label htmlFor="terms" className="text-sm leading-none">
          Acepto los{" "}
          <Link href="/terminos" className="text-[#2c6e49] hover:underline">
            Términos, Condiciones y Políticas de Minka
          </Link>
          .
        </label>
      </div>
      {form.formState.errors.acceptTerms && (
        <p className="text-sm text-red-500 mt-1">
          {form.formState.errors.acceptTerms.message}
        </p>
      )}

      {/* Submit Button */}
      <Button
        type="button"
        onClick={form.handleSubmit(onSubmit)}
        className="w-full bg-[#2c6e49] hover:bg-[#1e4d33] text-white font-medium py-2 rounded-full"
        disabled={isLoading}
      >
        {isLoading ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      {/* Social Login Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-gray-300 flex-grow" />
        <span className="mx-4 text-sm text-gray-500">O regístrate con</span>
        <div className="border-t border-gray-300 flex-grow" />
      </div>

      {/* Social Login Buttons */}
      <div className="grid grid-cols-3 gap-4">
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center border border-black rounded-md h-11"
          onClick={() => handleSocialSignIn("facebook")}
          disabled={!!socialLoading}
        >
          <Facebook className="h-5 w-5 text-blue-600" />
          <span className="ml-2">
            {socialLoading === "facebook" ? "Cargando..." : "Facebook"}
          </span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center border border-black rounded-md h-11"
          onClick={() => handleSocialSignIn("google")}
          disabled={!!socialLoading}
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-labelledby="googleIconTitle"
          >
            <title id="googleIconTitle">Google</title>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="ml-2">
            {socialLoading === "google" ? "Cargando..." : "Google"}
          </span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center border border-black rounded-md h-11"
          onClick={() => handleSocialSignIn("apple")}
          disabled={!!socialLoading}
        >
          <Apple className="h-5 w-5" />
          <span className="ml-2">
            {socialLoading === "apple" ? "Cargando..." : "Apple"}
          </span>
        </Button>
      </div>
    </div>
  );
}
