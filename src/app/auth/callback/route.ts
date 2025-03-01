import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
      const supabase = createRouteHandlerClient({ cookies });
      await supabase.auth.exchangeCodeForSession(code);
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        try {
          const userEmail = session.user.email || "";
          const defaultName = userEmail ? userEmail.split("@")[0] : "user";
          
          await prisma.profile.create({
            data: {
              email: userEmail,
              name: defaultName,
              phone: "",
              identityNumber: "",
              profilePicture: "",
              role: "user",
              status: "active",
              passwordHash: "",
              address: "",
              bio: "",
              location: "",
              birthDate: new Date(),
              joinDate: new Date(),
              activeCampaignsCount: 0,
              verificationStatus: false,
            },
          });
        } catch (error) {
          console.error('Error creating profile:', error);
        }
      }

      // Redirect to profile setup page
      return NextResponse.redirect(`${requestUrl.origin}/profile/setup`);
    }

    // If no code, redirect to home page
    return NextResponse.redirect(`${requestUrl.origin}`);
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
} 