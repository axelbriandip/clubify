import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, firstName, lastName, clubName, clubSlug } = body;

    // Validación básica de campos requeridos
    if (!userId || !email || !firstName || !lastName || !clubName || !clubSlug) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios para el registro" },
        { status: 400 }
      )
    }

    const cleanSlug = clubSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");

    // Iniciamos una transacción de base de datos con Prisma para asegurar
    // que todo se cree completo (Club, Configuración, Rol, Usuario, Relación)
    const result = await db.$transaction(async (tx) => {
      // 1. Crear el Club
      const newClub = await tx.club.create({
        data: {
          name: clubName,
          slug: cleanSlug,
          billingEmail: email,
          country: "Argentina", // Por defecto, modificable en la sección de datos del club
          city: "Sin especificar",
        },
      });

      // 2. Crear las preferencias por defecto del Club
      await tx.clubSettings.create({
        data: {
          clubId: newClub.id,
          logoColorUrl: "", // Inicializado vacío
          primaryColor: "#004b93", // Azul por defecto
          secondaryColor: "#ffffff", // Blanco por defecto
          fontFamily: "Inter",
        },
      });

      // 3. Buscar o crear el rol "owner" (propietario)
      let ownerRole = await tx.role.findFirst({
        where: { name: "owner" },
      });

      if (!ownerRole) {
        ownerRole = await tx.role.create({
          data: {
            name: "owner",
            description: "Propietario del club con acceso y control total",
            permissions: {
              manage_billing: true,
              edit_news: true,
              edit_sports: true,
              view_contacts: true,
            },
          },
        });
      }

      // 4. Crear el registro del Usuario sincronizado con el ID de Supabase Auth
      const newUser = await tx.user.create({
        data: {
          id: userId, // Es exactamente el mismo UUID provisto por Supabase Auth
          email: email,
          passwordHash: "", // No guardamos contraseñas localmente (de eso se encarga Supabase Auth)
          firstName: firstName,
          lastName: lastName,
        },
      });

      // 5. Vincular al Usuario con el Club y asignarle el rol de Owner
      await tx.clubUser.create({
        data: {
          clubId: newClub.id,
          userId: newUser.id,
          roleId: ownerRole.id,
          isPrimary: true,
        },
      });

      return { club: newClub, user: newUser };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error en API de Registro:", error);
    
    // Control de claves duplicadas en la base de datos (Unique constraints)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "El subdominio ya se encuentra registrado por otro club. Elige uno diferente." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Ocurrió un error interno en el servidor al intentar registrar el club" },
      { status: 500 }
    );
  }
}
