import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "Falta el ID del usuario en la solicitud" },
      { status: 400 }
    );
  }

  try {
    // Buscar la relación del usuario con el club y traer los datos del club y su config visual
    const clubUser = await db.clubUser.findFirst({
      where: { userId: userId },
      include: {
        club: {
          include: {
            settings: true,
          },
        },
      },
    });

    if (!clubUser) {
      return NextResponse.json(
        { error: "No se encontró ningún club asociado a este usuario" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      club: clubUser.club,
    });
  } catch (error: any) {
    console.error("Error al obtener club del usuario:", error);
    return NextResponse.json(
      { error: "Error interno al buscar los datos del club" },
      { status: 500 }
    );
  }
}
