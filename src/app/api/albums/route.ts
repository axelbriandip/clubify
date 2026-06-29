import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Recuperar todos los álbumes de fotos de un club (con sus fotos)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "Falta el ID del club" }, { status: 400 });
  }

  try {
    const albums = await db.photoAlbum.findMany({
      where: { clubId: clubId },
      include: {
        photos: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: albums });
  } catch (error: any) {
    console.error("Error al obtener álbumes de fotos:", error);
    return NextResponse.json(
      { error: "Error interno al recuperar los álbumes de fotos" },
      { status: 500 }
    );
  }
}

// POST: Crear un nuevo álbum de fotos (con fotos iniciales si se proveen)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clubId, title, description, coverImageUrl, photos } = body;

    if (!clubId || !title) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios (Club ID y Título del álbum)" },
        { status: 400 }
      );
    }

    // Preparar inserción transaccional de álbum + fotos
    const newAlbum = await db.photoAlbum.create({
      data: {
        clubId,
        title,
        description: description || "",
        coverImageUrl: coverImageUrl || "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=800&auto=format&fit=crop&q=80",
        sortOrder: 1,
        photos: {
          create: (photos || []).map((p: any, index: number) => ({
            imageUrl: p.imageUrl,
            caption: p.caption || "",
            sortOrder: index + 1,
          })),
        },
      },
      include: { photos: true },
    });

    return NextResponse.json({ success: true, data: newAlbum });
  } catch (error: any) {
    console.error("Error al crear álbum de fotos:", error);
    return NextResponse.json(
      { error: "Error interno al registrar el álbum de fotos" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar un álbum y todas sus fotos asociadas cascade
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Falta el ID del álbum" }, { status: 400 });
    }

    await db.photoAlbum.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Álbum eliminado correctamente" });
  } catch (error: any) {
    console.error("Error al eliminar álbum:", error);
    return NextResponse.json(
      { error: "Error interno al eliminar el álbum de fotos" },
      { status: 500 }
    );
  }
}
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, coverImageUrl, photos } = body;

    if (!id) {
      return NextResponse.json({ error: "Falta el ID del álbum" }, { status: 400 });
    }

    // Actualizar datos básicos del álbum
    const updatedAlbum = await db.photoAlbum.update({
      where: { id },
      data: {
        title,
        description,
        coverImageUrl,
      },
    });

    // Si se envían fotos, primero eliminamos las anteriores e insertamos las nuevas para simplificar
    if (photos) {
      await db.photo.deleteMany({ where: { albumId: id } });
      await db.photo.createMany({
        data: photos.map((p: any, index: number) => ({
          albumId: id,
          imageUrl: p.imageUrl,
          caption: p.caption || "",
          sortOrder: index + 1,
        })),
      });
    }

    const fullAlbum = await db.photoAlbum.findUnique({
      where: { id },
      include: { photos: true },
    });

    return NextResponse.json({ success: true, data: fullAlbum });
  } catch (error: any) {
    console.error("Error al actualizar álbum:", error);
    return NextResponse.json(
      { error: "Error interno al modificar el álbum de fotos" },
      { status: 500 }
    );
  }
}
