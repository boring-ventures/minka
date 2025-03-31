import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if the user is authenticated
  const isAuthenticated = !!session;

  // Define protected routes
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/profile") ||
    req.nextUrl.pathname.startsWith("/campaigns/create") ||
    req.nextUrl.pathname.startsWith("/create-campaign");

  // Define auth routes (sign-in, sign-up)
  const isAuthRoute =
    req.nextUrl.pathname.startsWith("/sign-in") ||
    req.nextUrl.pathname.startsWith("/sign-up");

  // Redirect authenticated users trying to access auth routes to dashboard
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Redirect unauthenticated users trying to access protected routes to sign-in
  if (!isAuthenticated && isProtectedRoute) {
    // Store the original URL to redirect back after sign-in
    const returnUrl = req.nextUrl.pathname;
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("returnUrl", returnUrl);
    return NextResponse.redirect(signInUrl);
  }

  return res;
}

// Define which routes this middleware should run on
export const config = {
  matcher: [
    // Protected routes
    "/dashboard/:path*",
    "/profile/:path*",
    "/campaigns/create/:path*",
    "/create-campaign",
    // Auth routes
    "/sign-in",
    "/sign-up",
  ],
};
