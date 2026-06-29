import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST: Registrar una nueva solicitud de preinscripción de socio en el club
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clubId,
      firstName,
      lastName,
      documentId,
      dateOfBirth,
      email,
      phone,
      address,
      desiredTier,
    } = body;

    // Validación de campos mandatorios
    if (!clubId || !firstName || !lastName || !documentId || !dateOfBirth || !email || !phone) {
      return NextResponse.json(
        { error: "Por favor, completa todos los campos requeridos en la solicitud" },
        { status: 400 }
      );
    }

    const newApplication = await db.memberApplication.create({
      data: {
        clubId,
        firstName,
        lastName,
        documentId,
        dateOfBirth: new Date(dateOfBirth),
        email,
        phone,
        address: address || "",
        membershipTierDesired: desiredTier || "Básico",
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, data: newApplication });
  } catch (error: any) {
    console.error("Error al guardar preinscripción de socio:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al procesar y registrar tu solicitud de socio" },
      { status: 550 }
    );
  }
}
