import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Find the anonymous profile or create it if it doesn't exist
    let anonymousProfile = await prisma.profile.findFirst({
      where: {
        email: "anonymous@minka.org",
        identityNumber: "ANONYMOUS",
        name: "Donante Anónimo",
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!anonymousProfile) {
      // Create an anonymous profile if it doesn't exist
      anonymousProfile = await prisma.profile.create({
        data: {
          email: "anonymous@minka.org",
          identityNumber: "ANONYMOUS",
          name: "Donante Anónimo",
          passwordHash: "not-applicable",
          phone: "0000000000",
          birthDate: new Date("1900-01-01"),
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    }

    return NextResponse.json({ profile: anonymousProfile });
  } catch (error) {
    console.error("Anonymous profile error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve anonymous profile" },
      { status: 500 }
    );
  }
}
