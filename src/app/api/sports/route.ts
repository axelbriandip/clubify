import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Recuperar todos los deportes (disciplines) con sus respectivas categorías
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "Falta el ID del club" }, { status: 400 });
  }

  try {
    const disciplines = await db.discipline.findMany({
      where: { clubId: clubId, isActive: true },
      include: {
        categories: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, data: disciplines });
  } catch (error: any) {
    console.error("Error al listar disciplinas:", error);
    return NextResponse.json(
      { error: "Error al recuperar las disciplinas deportivas" },
      { status: 500 }
    );
  }
}

// POST: Crear un nuevo deporte (discipline) y generar su slug automático
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clubId, name, description, imageUrl, sortOrder } = body;

    if (!clubId || !name) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (Club ID y Nombre)" },
        { status: 400 }
      );
    }

    // Convertir nombre a slug limpio (ej: "Fútbol Masculino" -> "futbol-masculino")
    const cleanSlug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remueve acentos
      .replace(/[^a-z0-9-]/g, "-") // Cambia caracteres raros por guión
      .replace(/-+/g, "-") // Remueve guiones repetidos
      .replace(/^-|-$/g, ""); // Remueve guiones en bordes

    const newDiscipline = await db.discipline.create({
      data: {
        clubId,
        name,
        description: description || "",
        imageUrl: imageUrl || "",
        slug: cleanSlug,
        sortOrder: sortOrder ? parseInt(sortOrder) : 10,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: newDiscipline });
  } catch (error: any) {
    console.error("Error al crear disciplina:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un deporte con este mismo nombre registrado en tu club" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno al crear el registro deportivo" },
      { status: 500 }
    );
  }
}
