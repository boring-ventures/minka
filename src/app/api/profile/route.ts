import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { UserRole, Status, Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { 
      email,
      name,
      phone,
      identityNumber,
      profilePicture,
      role = "user",
      status = "active"
    } = json;

    if (!email || !name) {
      return new Response(JSON.stringify({ error: "Email and name are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { email },
    });

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: "Profile already exists for this email" }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create profile with all required fields
    const profile = await prisma.profile.create({
      data: {
        email,
        name,
        phone,
        identityNumber,
        profilePicture: profilePicture || "",
        role: role as UserRole,
        status: status as Status,
        address: "",
        bio: "",
        location: "",
        birthDate: new Date(),
        joinDate: new Date(),
        activeCampaignsCount: 0,
        verificationStatus: false,
      },
    });

    return new Response(JSON.stringify({ profile }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    const whereClause: Prisma.ProfileWhereInput = {};

    if (role) whereClause.role = role as UserRole;
    if (status) whereClause.status = status as Status;

    const profiles = await prisma.profile.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
