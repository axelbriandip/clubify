import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Listar todos los correos del boletín de un club (para el dashboard)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "Falta el ID del club" }, { status: 400 });
  }

  try {
    const subscribers = await db.newsletterSubscriber.findMany({
      where: { clubId: clubId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: subscribers });
  } catch (error: any) {
    console.error("Error al obtener suscriptores del boletín:", error);
    return NextResponse.json(
      { error: "Error al recuperar la lista de suscriptores" },
      { status: 500 }
    );
  }
}

// POST: Registrar un correo en el boletín de novedades del club
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clubId, email } = body;

    if (!clubId || !email) {
      return NextResponse.json(
        { error: "Se requiere un correo electrónico válido" },
        { status: 400 }
      );
    }

    // Verificar si ya está suscripto en este club
    const existingSubscriber = await db.newsletterSubscriber.findFirst({
      where: {
        clubId: clubId,
        email: email.toLowerCase().trim(),
      },
    });

    if (existingSubscriber) {
      return NextResponse.json(
        { error: "Este correo electrónico ya se encuentra registrado en el boletín de novedades." },
        { status: 400 }
      );
    }

    const newSubscriber = await db.newsletterSubscriber.create({
      data: {
        clubId,
        email: email.toLowerCase().trim(),
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, data: newSubscriber });
  } catch (error: any) {
    console.error("Error al guardar suscriptor de boletín:", error);
    return NextResponse.json(
      { error: "Ocurrió un error interno al registrar tu suscripción" },
      { status: 500 }
    );
  }
}
