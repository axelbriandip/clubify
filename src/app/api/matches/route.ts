import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Listar todos los partidos del club con soporte opcional de filtros
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");
  const categoryId = searchParams.get("categoryId");

  if (!clubId) {
    return NextResponse.json({ error: "Falta el ID del club" }, { status: 400 });
  }

  try {
    const whereClause: any = { clubId: clubId };
    
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const matches = await db.match.findMany({
      where: whereClause,
      include: {
        category: {
          include: {
            discipline: true,
          },
        },
        homeTeam: true,
        awayTeam: true,
        facility: true,
        tournament: true,
      },
      orderBy: { matchDate: "desc" },
    });

    return NextResponse.json({ success: true, data: matches });
  } catch (error: any) {
    console.error("Error al listar partidos:", error);
    return NextResponse.json(
      { error: "Error al recuperar los partidos" },
      { status: 550 }
    );
  }
}

// POST: Registrar / Programar un nuevo partido
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clubId,
      categoryId,
      tournamentId,
      homeTeamId,
      awayTeamId,
      matchDate,
      matchTime, // Recibido como string "HH:MM"
      facilityId,
      customLocationName,
      customLocationAddress,
    } = body;

    if (!clubId || !categoryId || !homeTeamId || !awayTeamId || !matchDate) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios para registrar el partido" },
        { status: 400 }
      );
    }

    // Convertir matchTime "HH:MM" a objeto Date de Postgres (Time)
    let parsedTime: Date | null = null;
    if (matchTime) {
      const [hours, minutes] = matchTime.split(":");
      const timeDate = new Date();
      timeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      parsedTime = timeDate;
    }

    const newMatch = await db.match.create({
      data: {
        clubId,
        categoryId,
        tournamentId: tournamentId || null,
        homeTeamId,
        awayTeamId,
        matchDate: new Date(matchDate),
        matchTime: parsedTime,
        facilityId: facilityId || null,
        customLocationName: customLocationName || "",
        customLocationAddress: customLocationAddress || "",
        status: "SCHEDULED",
      },
    });

    return NextResponse.json({ success: true, data: newMatch });
  } catch (error: any) {
    console.error("Error al registrar partido:", error);
    return NextResponse.json(
      { error: "Error interno al crear el registro del partido" },
      { status: 500 }
    );
  }
}

// PUT: Cargar resultados y finalizar/actualizar un partido
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { matchId, homeScore, awayScore, status, matchSummary } = body;

    if (!matchId) {
      return NextResponse.json(
        { error: "Falta el ID del partido a actualizar" },
        { status: 400 }
      );
    }

    const updatedMatch = await db.match.update({
      where: { id: matchId },
      data: {
        homeScore: homeScore !== undefined && homeScore !== null ? parseInt(homeScore) : null,
        awayScore: awayScore !== undefined && awayScore !== null ? parseInt(awayScore) : null,
        status: status || "FINISHED",
        matchSummary: matchSummary || "",
      },
    });

    return NextResponse.json({ success: true, data: updatedMatch });
  } catch (error: any) {
    console.error("Error al actualizar partido:", error);
    return NextResponse.json(
      { error: "Error interno al actualizar el resultado del partido" },
      { status: 550 }
    );
  }
}
