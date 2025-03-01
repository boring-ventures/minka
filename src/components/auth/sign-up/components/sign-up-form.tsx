'use client'
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FacebookIcon, GithubIcon, UploadCloud } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/utils/password-input";
import type { SignUpFormProps, SignUpFormData } from "@/types/auth/sign-up";
import { signUpFormSchema } from "@/types/auth/sign-up";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import { uploadAvatar } from "@/lib/supabase/upload-avatar";
import { useRouter } from "next/navigation";

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      email: "",
      name: "",
      phone: "",
      identityNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: SignUpFormData) {
    try {
      setIsLoading(true);

      const { success, user, session, error } = await signUp(
        data.email,
        data.password
      );

      if (!success || error || !session) {
        throw error || new Error("Failed to sign up");
      }

      if (user) {
        let profilePicture = null;
        if (avatarFile) {
          try {
            profilePicture = await uploadAvatar(avatarFile, user.id);
          } catch (error) {
            console.error("Avatar upload failed:", error);
            toast({
              title: "Warning",
              description: "Failed to upload avatar, you can add it later from your profile.",
              variant: "default",
            });
          }
        }

        const response = await fetch("/api/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.email,
            name: data.name,
            phone: data.phone,
            identityNumber: data.identityNumber,
            profilePicture,
            role: "user",
            status: "active",
          }),
        });

        let result: Record<string, unknown>;
        let text = ""; // Define text outside the try block

        try {
          text = await response.text(); // Assign value inside try
          result = text ? JSON.parse(text) : {};

          if (!response.ok) {
            throw new Error(
              typeof result.error === "string"
                ? result.error
                : `Server responded with status ${response.status}`
            );
          }
        } catch (parseError) {
          console.error(
            "Response parsing error:",
            parseError,
            "Response text:",
            text
          );
          throw new Error("Invalid server response");
        }

        toast({
          title: "Success",
          description: "Your account has been created successfully!",
        });

        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Sign up error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-24 w-24">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar preview"
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                  <UploadCloud className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <Input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="w-full max-w-xs"
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="identityNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Identity Number</FormLabel>
                <FormControl>
                  <Input placeholder="ID Number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full" disabled={isLoading}>
            Create Account
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="w-full"
          type="button"
          disabled={isLoading}
        >
          <GithubIcon className="h-4 w-4" /> GitHub
        </Button>
        <Button
          variant="outline"
          className="w-full"
          type="button"
          disabled={isLoading}
        >
          <FacebookIcon className="h-4 w-4" /> Facebook
        </Button>
      </div>
    </div>
  );
}
