import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      documentId,
      birthDate,
      phone,
    } = requestData;

    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies });

    // Register the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Format birth date from DD/MM/YYYY to a Date object
    const [day, month, year] = birthDate.split("/");
    const formattedBirthDate = new Date(`${year}-${month}-${day}`);

    // Create a profile in the database
    await prisma.profile.create({
      data: {
        id: authData.user.id,
        name: `${firstName} ${lastName}`,
        email,
        passwordHash: "", // We don't store the actual password, Supabase handles auth
        profilePicture: "", // Default empty profile picture
        identityNumber: documentId,
        phone,
        birthDate: formattedBirthDate,
        address: "",
        bio: "",
        location: "",
        joinDate: new Date(),
        status: "active",
      },
    });

    return NextResponse.json(
      {
        message: "User registered successfully",
        userId: authData.user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Failed to register user", details: errorMessage },
      { status: 500 }
    );
  }
}
