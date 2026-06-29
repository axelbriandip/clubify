import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Listar todas las personas asociadas al club (con sus roles)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "Falta el ID del club" }, { status: 400 });
  }

  try {
    const people = await db.person.findMany({
      where: { clubId: clubId, isActive: true },
      include: {
        boardMembers: true,
        staffMembers: true,
        players: {
          include: {
            categories: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: [
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    });

    return NextResponse.json({ success: true, data: people });
  } catch (error: any) {
    console.error("Error al listar personas:", error);
    return NextResponse.json(
      { error: "Error al recuperar la lista de personas" },
      { status: 500 }
    );
  }
}

// POST: Crear una nueva persona y sus perfiles de rol (Directivo, Staff, Jugador)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clubId,
      firstName,
      lastName,
      nickname,
      dateOfBirth,
      placeOfBirth,
      nationality,
      email,
      phone,
      address,
      emergencyContactName,
      emergencyContactPhone,
      documentId,
      bloodType,
      medicalClearanceExpiry,
      memberNumber,
      // Indicadores de roles activos
      isBoardMember,
      isStaffMember,
      isPlayer,
      // Datos específicos de cada rol
      boardData,
      staffData,
      playerData,
    } = body;

    if (!clubId || !firstName || !lastName || !dateOfBirth) {
      return NextResponse.json(
        { error: "Faltan campos esenciales (Club ID, Nombre, Apellido, Fecha Nac.)" },
        { status: 400 }
      );
    }

    // Ejecutar creación transaccional
    const result = await db.$transaction(async (tx) => {
      // 1. Crear el registro base en la tabla 'people'
      const newPerson = await tx.person.create({
        data: {
          clubId,
          firstName,
          lastName,
          nickname,
          dateOfBirth: new Date(dateOfBirth),
          placeOfBirth,
          nationality,
          email,
          phone,
          address,
          emergencyContactName,
          emergencyContactPhone,
          documentId,
          bloodType,
          medicalClearanceExpiry: medicalClearanceExpiry ? new Date(medicalClearanceExpiry) : null,
          memberNumber,
          isActive: true,
        },
      });

      // 2. Si tiene rol de Directivo, crearlo
      if (isBoardMember && boardData) {
        await tx.boardMember.create({
          data: {
            clubId,
            personId: newPerson.id,
            position: boardData.position || "Vocal",
            termStart: boardData.termStart ? new Date(boardData.termStart) : null,
            termEnd: boardData.termEnd ? new Date(boardData.termEnd) : null,
            photoSquareUrl: boardData.photoSquareUrl || "",
            photoHorizontalUrl: boardData.photoHorizontalUrl || "",
            photoVerticalUrl: boardData.photoVerticalUrl || "",
            sortOrder: boardData.sortOrder || 10,
            isActive: true,
          },
        });
      }

      // 3. Si tiene rol de Cuerpo Técnico (Staff), crearlo
      if (isStaffMember && staffData) {
        await tx.staffMember.create({
          data: {
            clubId,
            personId: newPerson.id,
            mainRole: staffData.mainRole || "Profesor",
            bio: staffData.bio || "",
            photoSquareUrl: staffData.photoSquareUrl || "",
            photoHorizontalUrl: staffData.photoHorizontalUrl || "",
            photoVerticalUrl: staffData.photoVerticalUrl || "",
            isActive: true,
          },
        });
      }

      // 4. Si tiene rol de Jugador, crearlo
      if (isPlayer && playerData) {
        await tx.player.create({
          data: {
            clubId,
            personId: newPerson.id,
            preferredSide: playerData.preferredSide || null,
            heightCm: playerData.heightCm ? parseInt(playerData.heightCm) : null,
            weightKg: playerData.weightKg ? parseFloat(playerData.weightKg) : null,
            previousClub: playerData.previousClub || "",
            bioDescription: playerData.bioDescription || "",
            photoSquareUrl: playerData.photoSquareUrl || "",
            photoHorizontalUrl: playerData.photoHorizontalUrl || "",
            photoVerticalUrl: playerData.photoVerticalUrl || "",
            isActive: true,
          },
        });
      }

      return newPerson;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error al crear persona:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al intentar registrar a la persona y sus roles" },
      { status: 500 }
    );
  }
}
