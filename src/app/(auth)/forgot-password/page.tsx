import { ForgotPasswordForm } from "@/components/auth/forgot-password/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Recuperar contraseña</h1>
        <p className="text-gray-500">
          Ingresa tu correo electrónico y te enviaremos un enlace para recuperar
          tu contraseña.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  );
}
