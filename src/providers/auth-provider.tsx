"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User, Session } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

// Explicitly define Profile type to match ProfileData structure used in the app
export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  role: string;
  created_at: string;
  identity_number?: string;
  birth_date?: string;
  profile_picture?: string;
  [key: string]: string | boolean | number | null | undefined;
}

type SignUpData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  documentId: string;
  birthDate: string;
  phone: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileFetchInProgress, setProfileFetchInProgress] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Debounced profile fetch to prevent multiple simultaneous calls
  const fetchProfile = async (userId: string) => {
    // Skip if a fetch is already in progress for the same user
    if (profileFetchInProgress) {
      console.log("Profile fetch already in progress, skipping redundant call");
      return null;
    }

    try {
      setProfileFetchInProgress(true);
      console.log("Fetching profile for user:", userId);

      const response = await fetch(`/api/profile/${userId}`, {
        // Add cache headers to prevent duplicate requests
        headers: {
          "Cache-Control": "max-age=60",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching profile:", errorData);
        throw new Error(errorData.error || "Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data.profile);
      return data.profile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
      return null;
    } finally {
      setProfileFetchInProgress(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (isMounted) {
          toast({
            title: "Error",
            description: "Error initializing authentication.",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      // Only update if the session actually changed to prevent redundant updates
      const currentUserId = session?.user?.id;
      const newUserId = newSession?.user?.id;

      if (currentUserId !== newUserId) {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      }

      if (event === "SIGNED_OUT") {
        router.push("/sign-in");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // Call our login API endpoint
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Authentication failed");
      }

      // Get the return URL if it exists
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get("returnUrl");
      const redirectPath = returnUrl || "/dashboard";

      // Prefetch the dashboard page to make redirection faster
      router.prefetch(redirectPath);

      // Keep isLoading true to show the spinner during the session refresh
      // Don't navigate immediately, wait for the session to refresh first

      try {
        // Wait for session to refresh before navigation
        await supabase.auth.refreshSession();

        // Show success message
        toast({
          title: "Éxito",
          description: "Has iniciado sesión correctamente.",
        });

        // Navigate after session is refreshed
        router.push(redirectPath);
      } catch (err) {
        console.error("Session refresh error:", err);
        toast({
          title: "Error",
          description: "Error al actualizar la sesión.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setProfile(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      setIsLoading(true);

      // Call our custom registration endpoint
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Registration API error:", errorData);

        // Enhanced error message that includes the details if available
        const errorMessage = errorData.error
          ? errorData.details
            ? `${errorData.error}: ${errorData.details}`
            : errorData.error
          : "Registration failed";

        throw new Error(errorMessage);
      }

      const responseData = await response.json();

      toast({
        title: "Éxito",
        description: "Cuenta creada exitosamente. Por favor inicia sesión.",
      });

      // Redirect to sign-in page after successful registration
      router.push("/sign-in?registered=true");
      return responseData;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Registration failed",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      console.log("Attempting sign out via API...");

      // Call the server-side logout endpoint
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      // Check if the API call itself failed (network error, etc.)
      if (!response.ok) {
        let errorData = { error: "Logout API call failed", details: "" };
        try {
          errorData = await response.json();
        } catch (e) {
          // Ignore error if response body is not JSON
        }
        console.error("Logout API error:", errorData);
        toast({
          title: "Error",
          description: `${errorData.error}${errorData.details ? `: ${errorData.details}` : ""}`,
          variant: "destructive",
        });
        // Throw an error to stop execution
        throw new Error(errorData.error || "Logout API call failed");
      }

      // API call was successful (status 2xx)
      // The server has initiated the sign-out and cleared the cookie.
      console.log("Logout API call successful.");

      // Manually clear user state
      setUser(null);
      setSession(null);
      setProfile(null);

      // Show success toast
      toast({
        title: "Éxito",
        description: "Has cerrado sesión correctamente.",
      });

      // Manually redirect to sign-in page
      router.push("/sign-in");
    } catch (error) {
      // Catch errors from the fetch call or the explicit throw above
      console.error("Sign out process error:", error);
      // Avoid showing a generic toast if a specific one was already shown
      if (!(error instanceof Error && error.message.includes("Logout API"))) {
        toast({
          title: "Error",
          description: "An unexpected error occurred during sign out.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, isLoading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
