import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST: Crear una nueva categoría dentro de una disciplina deportiva
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { disciplineId, name, ageRange, gender, sortOrder } = body;

    if (!disciplineId || !name) {
      return NextResponse.json(
        { error: "Faltan campos requeridos (Discipline ID y Nombre)" },
        { status: 400 }
      );
    }

    const newCategory = await db.category.create({
      data: {
        disciplineId,
        name,
        ageRange: ageRange || "",
        gender: gender || null,
        sortOrder: sortOrder ? parseInt(sortOrder) : 10,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: newCategory });
  } catch (error: any) {
    console.error("Error al crear categoría:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al intentar crear la categoría" },
      { status: 500 }
    );
  }
}
