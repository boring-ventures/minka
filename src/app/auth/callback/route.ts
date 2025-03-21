import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient({
      cookies: () => cookies(),
    });

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error.message);
      return NextResponse.redirect(
        new URL(
          `/sign-in?error=${encodeURIComponent(error.message)}`,
          request.url
        )
      );
    }

    // Check if the user already has a profile
    if (data.user) {
      const existingProfile = await prisma.profile.findUnique({
        where: { id: data.user.id },
      });

      // If the user doesn't have a profile, create one
      if (!existingProfile) {
        try {
          // Get user metadata from Supabase
          const { data: userData } = await supabase.auth.getUser();
          const userMetadata = userData.user?.user_metadata;

          // Create a profile in the database
          await prisma.profile.create({
            data: {
              id: data.user.id,
              name:
                userMetadata?.full_name ||
                `${userMetadata?.first_name || ""} ${userMetadata?.last_name || ""}`.trim() ||
                data.user.email?.split("@")[0] ||
                "User",
              email: data.user.email || "",
              passwordHash: "", // We don't store the actual password
              profilePicture: userMetadata?.avatar_url || "",
              identityNumber: "", // This would need to be collected later
              phone: userMetadata?.phone || "",
              birthDate: new Date(), // This would need to be collected later
              address: "",
              bio: "",
              location: "",
              joinDate: new Date(),
              status: "active",
            },
          });
        } catch (error) {
          console.error("Error creating profile:", error);
        }
      }
    }
  }

  // Redirect to the dashboard
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
