import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET handler to retrieve transfer history for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const campaignId = (await params).id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get the campaign to verify ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { organizerId: true },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaña no encontrada" },
        { status: 404 }
      );
    }

    // Check if user is the campaign owner or an admin
    const userProfile = await prisma.profile.findUnique({
      where: { email: session.user.email as string },
      select: { id: true, role: true },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "Perfil de usuario no encontrado" },
        { status: 404 }
      );
    }

    if (
      campaign.organizerId !== userProfile.id &&
      userProfile.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "No tienes permiso para ver esta información" },
        { status: 403 }
      );
    }

    // Get transfer history with pagination
    const [transfers, totalCount] = await Promise.all([
      prisma.fundTransfer.findMany({
        where: { campaignId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.fundTransfer.count({
        where: { campaignId },
      }),
    ]);

    return NextResponse.json({
      transfers,
      totalCount,
      hasMore: offset + limit < totalCount,
    });
  } catch (error) {
    console.error("Error fetching transfer history:", error);
    return NextResponse.json(
      { error: "Error al obtener el historial de transferencias" },
      { status: 500 }
    );
  }
}

// POST handler to create a new fund transfer request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const campaignId = (await params).id;
    const data = await request.json();

    // Validate required fields
    const {
      accountHolderName,
      bankName,
      accountNumber,
      amount,
      frequency = "monthly_once",
    } = data;

    if (!accountHolderName || !bankName || !accountNumber || !amount) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Get the campaign to verify ownership and available funds
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        organizerId: true,
        collectedAmount: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaña no encontrada" },
        { status: 404 }
      );
    }

    // Check if user is the campaign owner or an admin
    const userProfile = await prisma.profile.findUnique({
      where: { email: session.user.email as string },
      select: { id: true, role: true },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: "Perfil de usuario no encontrado" },
        { status: 404 }
      );
    }

    if (
      campaign.organizerId !== userProfile.id &&
      userProfile.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "No tienes permiso para solicitar transferencias" },
        { status: 403 }
      );
    }

    // Check if there are sufficient funds
    if (campaign.collectedAmount.lessThan(new Prisma.Decimal(amount))) {
      return NextResponse.json(
        { error: "Fondos insuficientes para esta transferencia" },
        { status: 400 }
      );
    }

    // Create the fund transfer request
    const fundTransfer = await prisma.fundTransfer.create({
      data: {
        campaignId,
        accountHolderName,
        bankName,
        accountNumber,
        amount: new Prisma.Decimal(amount),
        frequency: frequency as any,
        status: "processing",
      },
    });

    return NextResponse.json({
      message: "Solicitud de transferencia creada exitosamente",
      transferId: fundTransfer.id,
    });
  } catch (error) {
    console.error("Error creating fund transfer:", error);
    return NextResponse.json(
      { error: "Error al crear la solicitud de transferencia" },
      { status: 500 }
    );
  }
}

// PATCH handler to update fund transfer status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const campaignId = (await params).id;
    const data = await request.json();
    const { transferId, status, notes } = data;

    if (!transferId || !status) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    // Check if user is an admin
    const userProfile = await prisma.profile.findUnique({
      where: { email: session.user.email as string },
      select: { role: true },
    });

    if (!userProfile || userProfile.role !== "admin") {
      return NextResponse.json(
        {
          error:
            "Solo administradores pueden actualizar el estado de transferencias",
        },
        { status: 403 }
      );
    }

    // Update the fund transfer
    const updatedTransfer = await prisma.fundTransfer.update({
      where: {
        id: transferId,
        campaignId,
      },
      data: {
        status: status as any,
        notes: notes || undefined,
        transferDate: status === "completed" ? new Date() : undefined,
      },
    });

    return NextResponse.json({
      message: "Estado de transferencia actualizado exitosamente",
      transfer: updatedTransfer,
    });
  } catch (error) {
    console.error("Error updating fund transfer:", error);
    return NextResponse.json(
      { error: "Error al actualizar el estado de la transferencia" },
      { status: 500 }
    );
  }
}
