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
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Facebook, Mail, Lock, Apple, ChevronDown } from "lucide-react";

const signInFormSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
});

type SignInFormData = z.infer<typeof signInFormSchema>;

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
      acceptTerms: false,
    },
  });

  async function onSubmit(data: SignInFormData) {
    try {
      setIsLoading(true);
      await signIn(data.email, data.password);
      toast({
        title: "Éxito",
        description: "Has iniciado sesión correctamente.",
      });
      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Credenciales inválidas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
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
            placeholder="correo@ejemplo.com"
            className="pl-10"
          />
        </div>
        {form.formState.errors.email && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="password"
            type="password"
            {...form.register("password")}
            placeholder="••••••••"
            className="pl-10"
          />
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-red-500 mt-1">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

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

      <Button
        type="button"
        onClick={form.handleSubmit(onSubmit)}
        className="w-full bg-[#2c6e49] hover:bg-[#1e4d33] text-white font-medium py-2 rounded-full"
        disabled={isLoading}
      >
        Iniciar sesión
      </Button>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-gray-300 flex-grow" />
        <span className="mx-4 text-sm text-gray-500">Iniciar sesión con</span>
        <div className="border-t border-gray-300 flex-grow" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center border rounded-full"
        >
          <Facebook className="h-5 w-5 text-blue-600" />
          <span className="ml-2">Facebook</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center border rounded-full"
        >
          <svg
            className="h-5 w-5 mr-2"
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
          <span>Google</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center border rounded-full"
        >
          <Apple className="h-5 w-5" />
          <span className="ml-2">Apple</span>
        </Button>
      </div>
    </div>
  );
}
