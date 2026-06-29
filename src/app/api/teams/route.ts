import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Recuperar la lista de equipos asociados al club (propios y rivales)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "Falta el ID del club" }, { status: 400 });
  }

  try {
    const teams = await db.team.findMany({
      where: { clubId: clubId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: teams });
  } catch (error: any) {
    console.error("Error al listar equipos:", error);
    return NextResponse.json(
      { error: "Error al recuperar los equipos" },
      { status: 500 }
    );
  }
}

// POST: Crear un nuevo equipo en el sistema
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clubId, name, shortName, isOwnClub, logoColorUrl } = body;

    if (!clubId || !name) {
      return NextResponse.json(
        { error: "Faltan campos requeridos (Club ID y Nombre del equipo)" },
        { status: 400 }
      );
    }

    const newTeam = await db.team.create({
      data: {
        clubId,
        name,
        shortName: shortName || "",
        logoColorUrl: logoColorUrl || "",
        isOwnClub: isOwnClub || false,
      },
    });

    return NextResponse.json({ success: true, data: newTeam });
  } catch (error: any) {
    console.error("Error al crear equipo:", error);
    return NextResponse.json(
      { error: "Error interno al registrar el equipo" },
      { status: 500 }
    );
  }
}
