import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const slug = searchParams.get("slug");

  if (!userId && !slug) {
    return NextResponse.json(
      { error: "Falta el ID del usuario o el slug en la solicitud" },
      { status: 400 }
    );
  }

  try {
    // Si se pasa slug, buscamos directamente el club por su slug de subdominio
    if (slug) {
      const club = await db.club.findUnique({
        where: { slug: slug.toLowerCase().trim() },
        include: {
          settings: true,
        },
      });

      if (!club) {
        return NextResponse.json(
          { error: "No se encontró ningún club con este subdominio" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        club: club,
      });
    }

    // Buscar la relación del usuario con el club y traer los datos del club y su config visual
    const clubUser = await db.clubUser.findFirst({
      where: { userId: userId! },
      include: {
        club: {
          include: {
            settings: true,
          },
        },
      },
    });

    if (!clubUser) {
      return NextResponse.json(
        { error: "No se encontró ningún club asociado a este usuario" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      club: clubUser.club,
    });
  } catch (error: any) {
    console.error("Error al obtener club del usuario:", error);
    return NextResponse.json(
      { error: "Error interno al buscar los datos del club" },
      { status: 500 }
    );
  }
}

// PUT: Actualizar la configuración visual e institucional (settings) del club
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      clubId,
      primaryColor,
      secondaryColor,
      fontFamily,
      heroTitle,
      heroSubtitle,
      heroCtaText,
      heroCtaLink,
      contactEmail,
      contactPhone,
      whatsappNumber,
      addressText,
    } = body;

    if (!clubId) {
      return NextResponse.json(
        { error: "Falta el ID del club para actualizar la configuración" },
        { status: 400 }
      );
    }

    const updatedSettings = await db.clubSettings.update({
      where: { clubId: clubId },
      data: {
        primaryColor,
        secondaryColor,
        fontFamily: fontFamily || "Inter",
        heroTitle,
        heroSubtitle,
        heroCtaText,
        heroCtaLink,
        contactEmail,
        contactPhone,
        whatsappNumber,
        addressText,
      },
    });

    return NextResponse.json({ success: true, data: updatedSettings });
  } catch (error: any) {
    console.error("Error al actualizar la configuración visual del club:", error);
    return NextResponse.json(
      { error: "Ocurrió un error interno al intentar guardar los cambios visuales" },
      { status: 500 }
    );
  }
}
