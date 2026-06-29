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

// GET: Recuperar todas las preinscripciones de socios de un club
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "Falta el ID del club" }, { status: 400 });
  }

  try {
    const applications = await db.memberApplication.findMany({
      where: { clubId: clubId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: applications });
  } catch (error: any) {
    console.error("Error al obtener solicitudes de socios:", error);
    return NextResponse.json(
      { error: "Error al recuperar las solicitudes" },
      { status: 500 }
    );
  }
}

// PUT: Aprobar o rechazar la solicitud de un socio (con creación automática de persona si se aprueba)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, rejectionReason } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Faltan datos requeridos (ID y nuevo estado)" },
        { status: 400 }
      );
    }

    const updatedApplication = await db.memberApplication.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? (rejectionReason || "No cumple con las condiciones") : null,
      },
    });

    // Regla de Negocio: Si la solicitud es APROBADA, creamos automáticamente su ficha en 'people'
    if (status === "APPROVED") {
      const existingPerson = await db.person.findFirst({
        where: {
          clubId: updatedApplication.clubId,
          documentId: updatedApplication.documentId,
        },
      });

      // Evitar crear registros de personas duplicadas si ya existía por DNI
      if (!existingPerson) {
        // Generar un número de socio secuencial o aleatorio para la demostración
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        
        await db.person.create({
          data: {
            clubId: updatedApplication.clubId,
            firstName: updatedApplication.firstName,
            lastName: updatedApplication.lastName,
            dateOfBirth: updatedApplication.dateOfBirth,
            email: updatedApplication.email,
            phone: updatedApplication.phone,
            address: updatedApplication.address,
            documentId: updatedApplication.documentId,
            memberNumber: `SOC-${randomNum}`,
            isActive: true,
          },
        });
      }
    }

    return NextResponse.json({ success: true, data: updatedApplication });
  } catch (error: any) {
    console.error("Error al actualizar solicitud de socio:", error);
    return NextResponse.json(
      { error: "Error interno al actualizar la solicitud de preinscripción" },
      { status: 500 }
    );
  }
}
