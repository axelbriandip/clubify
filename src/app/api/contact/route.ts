import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Recuperar los mensajes de contacto de un club (para el dashboard)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "Falta el ID del club" }, { status: 400 });
  }

  try {
    const submissions = await db.contactSubmission.findMany({
      where: { clubId: clubId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: submissions });
  } catch (error: any) {
    console.error("Error al obtener mensajes de contacto:", error);
    return NextResponse.json(
      { error: "Error al recuperar los mensajes" },
      { status: 500 }
    );
  }
}

// POST: Registrar un nuevo mensaje de contacto enviado desde la web pública
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clubId, name, email, phone, message } = body;

    if (!clubId || !name || !email || !message) {
      return NextResponse.json(
        { error: "Por favor, completa los campos obligatorios (Nombre, Email y Mensaje)" },
        { status: 400 }
      );
    }

    const newSubmission = await db.contactSubmission.create({
      data: {
        clubId,
        name,
        email,
        phone: phone || "",
        message,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, data: newSubmission });
  } catch (error: any) {
    console.error("Error al guardar mensaje de contacto:", error);
    return NextResponse.json(
      { error: "Ocurrió un error interno al intentar enviar tu mensaje" },
      { status: 500 }
    );
  }
}

// PUT: Cambiar el estado de un mensaje de contacto (Leído, Respondió, Archivado)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Faltan datos requeridos (ID y nuevo estado)" },
        { status: 400 }
      );
    }

    const updatedSubmission = await db.contactSubmission.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: updatedSubmission });
  } catch (error: any) {
    console.error("Error al actualizar estado de mensaje:", error);
    return NextResponse.json(
      { error: "Error interno al modificar el estado del mensaje" },
      { status: 500 }
    );
  }
}
