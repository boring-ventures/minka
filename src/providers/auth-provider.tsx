"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User, Session } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import type { Profile } from "@/types/profile";
import { toast } from "@/components/ui/use-toast";

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
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Fetch profile function
  const fetchProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/profile/${userId}`);
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
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        toast({
          title: "Error",
          description: "Error initializing authentication.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      if (event === "SIGNED_OUT") {
        router.push("/sign-in");
      }
    });

    return () => {
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

      // Explicitly refresh the client-side session after successful API login
      // This ensures the Supabase client is aware of the session set by the API's cookies
      await supabase.auth.refreshSession();

      // Fetch profile immediately after ensuring session is refreshed
      const {
        data: { session: refreshedSession },
      } = await supabase.auth.getSession();
      if (refreshedSession?.user) {
        await fetchProfile(refreshedSession.user.id);
      } else {
        // This case should ideally not happen after a successful login and refresh
        console.warn(
          "Session was null even after successful login and refresh."
        );
        setProfile(null);
      }

      // Show success message
      toast({
        title: "Éxito",
        description: "Has iniciado sesión correctamente.",
      });

      // Check for returnUrl in the URL (for redirecting back after sign-in)
      const urlParams = new URLSearchParams(window.location.search);
      const returnUrl = urlParams.get("returnUrl");

      if (returnUrl) {
        // Redirect to the originally requested URL
        router.push(returnUrl);
      } else {
        // Default redirect to dashboard
        router.push("/dashboard");
      }

      // We don't really need to return data from the API call itself anymore
      // return data;
    } catch (error) {
      console.error("Login error:", error);
      // Make sure profile is cleared on login error
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
      // The client-side onAuthStateChange listener should now detect
      // the SIGNED_OUT event and handle state updates + redirection.
      console.log(
        "Logout API call successful. Waiting for auth state change..."
      );

      // Optional: Keep a success toast here, or rely solely on redirection
      toast({
        title: "Éxito",
        description: "Has cerrado sesión correctamente.",
      });

      // IMPORTANT: No manual state clearing or redirection here.
      // Rely entirely on the onAuthStateChange listener.
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
