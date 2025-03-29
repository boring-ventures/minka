import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type Session } from "@supabase/supabase-js";
import { cache } from "react";

export const getAuthSession = cache(async (): Promise<Session | null> => {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
});

export const requireAuth = async () => {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return session;
};

export const requireUnauth = async () => {
  const session = await getAuthSession();

  if (session) {
    redirect("/dashboard");
  }
};

export const getCurrentUser = async () => {
  const session = await getAuthSession();

  if (!session?.user) {
    return null;
  }

  return session.user;
};
