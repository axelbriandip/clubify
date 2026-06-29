import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "Falta el ID del club" }, { status: 400 });
  }

  try {
    // 1. Contar personas (socios/deportistas activos)
    const peopleCount = await db.person.count({
      where: { clubId: clubId, isActive: true },
    });

    // 2. Contar disciplinas deportivas activas
    const disciplinesCount = await db.discipline.count({
      where: { clubId: clubId, isActive: true },
    });

    // 3. Contar partidos disputados/programados este mes
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const matchesCount = await db.match.count({
      where: {
        clubId: clubId,
        matchDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // 4. Contar preinscripciones de socios pendientes
    const pendingApplicationsCount = await db.memberApplication.count({
      where: {
        clubId: clubId,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        peopleCount,
        disciplinesCount,
        matchesCount,
        pendingApplicationsCount,
      },
    });
  } catch (error: any) {
    console.error("Error al calcular estadísticas de dashboard:", error);
    return NextResponse.json(
      { error: "Error interno al calcular métricas de control" },
      { status: 550 }
    );
  }
}
