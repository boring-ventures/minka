import * as z from "zod"

export const signUpFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  identityNumber: z.string().min(5, "Identity number must be at least 5 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type SignUpFormData = z.infer<typeof signUpFormSchema>

export interface SignUpFormProps {
  onSubmit?: (data: SignUpFormData) => void;
  isLoading?: boolean;
  className?: string;
}
