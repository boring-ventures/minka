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

    // Validate required fields
    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !documentId ||
      !birthDate ||
      !phone
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }

    // Create a Supabase client with awaited cookies
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check if the profile already exists in our database
    const existingProfile = await prisma.profile.findUnique({
      where: { email },
    });

    if (existingProfile) {
      return NextResponse.json(
        {
          error: "User with this email already exists",
        },
        {
          status: 400,
        }
      );
    }

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
    let formattedBirthDate: Date;
    try {
      const [day, month, year] = birthDate.split("/");
      formattedBirthDate = new Date(`${year}-${month}-${day}`);

      // Check if date is valid
      if (isNaN(formattedBirthDate.getTime())) {
        throw new Error("Invalid date format");
      }
    } catch (error) {
      console.error("Error parsing birth date:", error);
      return NextResponse.json(
        {
          error: "Invalid birth date format. Please use DD/MM/YYYY",
        },
        {
          status: 400,
        }
      );
    }

    // Create a profile in the database
    try {
      await prisma.profile.create({
        data: {
          id: authData.user.id,
          name: `${firstName} ${lastName}`,
          email,
          passwordHash: "", // We don't store the actual password, Supabase handles auth
          identityNumber: documentId,
          phone,
          birthDate: formattedBirthDate,
          joinDate: new Date(),
          status: "active",
        },
      });
    } catch (error) {
      console.error("Error creating profile:", error);
      // We can't delete the auth user here as we don't have admin access
      // But we should report the error
      return NextResponse.json(
        {
          error: "Failed to create user profile",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }

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
