import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Server-side Supabase client (to be used in server components)
export const createServerClient = () => {
  return createServerComponentClient({ cookies });
};

// Function to get the current session
export const getSession = async () => {
  const supabase = createServerClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Error getting session:", error.message);
    return null;
  }

  return data.session;
};

// Function to get the current user
export const getUser = async () => {
  const session = await getSession();
  return session?.user || null;
};
