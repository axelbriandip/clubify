import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET: Recuperar todas las noticias (tanto publicadas como borradores) de un club
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clubId = searchParams.get("clubId");

  if (!clubId) {
    return NextResponse.json({ error: "Falta el ID del club" }, { status: 400 });
  }

  try {
    const news = await db.news.findMany({
      where: { clubId: clubId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: news });
  } catch (error: any) {
    console.error("Error al obtener noticias:", error);
    return NextResponse.json(
      { error: "Error al recuperar el listado de noticias" },
      { status: 500 }
    );
  }
}

// POST: Crear una nueva noticia institucional
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clubId, title, summary, content, imageUrl, category, isPublished } = body;

    if (!clubId || !title || !content) {
      return NextResponse.json(
        { error: "Faltan campos requeridos (Club ID, Título y Contenido)" },
        { status: 400 }
      );
    }

    // Generar slug limpio
    const cleanSlug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const newNews = await db.news.create({
      data: {
        clubId,
        title,
        slug: cleanSlug,
        summary: summary || "",
        content,
        imageUrl: imageUrl || "",
        category: category || "General",
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, data: newNews });
  } catch (error: any) {
    console.error("Error al crear noticia:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un artículo de prensa con un título idéntico en este club" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno al guardar el artículo de prensa" },
      { status: 550 }
    );
  }
}

// PUT: Modificar un artículo de prensa existente o cambiar su estado de publicación
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, summary, content, imageUrl, category, isPublished } = body;

    if (!id) {
      return NextResponse.json({ error: "Falta el ID del artículo" }, { status: 400 });
    }

    // Buscamos los datos actuales para comparar el estado de publicación
    const currentNews = await db.news.findUnique({ where: { id } });
    if (!currentNews) {
      return NextResponse.json({ error: "No se encontró el artículo de prensa" }, { status: 404 });
    }

    const dataToUpdate: any = {};
    if (title) {
      dataToUpdate.title = title;
      dataToUpdate.slug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    }
    if (summary !== undefined) dataToUpdate.summary = summary;
    if (content !== undefined) dataToUpdate.content = content;
    if (imageUrl !== undefined) dataToUpdate.imageUrl = imageUrl;
    if (category !== undefined) dataToUpdate.category = category;
    
    if (isPublished !== undefined) {
      dataToUpdate.isPublished = isPublished;
      // Si cambia de borrador a publicado, estampamos la fecha
      if (isPublished && !currentNews.isPublished) {
        dataToUpdate.publishedAt = new Date();
      } else if (!isPublished) {
        dataToUpdate.publishedAt = null;
      }
    }

    const updatedNews = await db.news.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, data: updatedNews });
  } catch (error: any) {
    console.error("Error al actualizar noticia:", error);
    return NextResponse.json(
      { error: "Error interno al modificar el artículo de prensa" },
      { status: 500 }
    );
  }
}

// DELETE: Borrar físicamente una noticia
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Falta el ID del artículo" }, { status: 400 });
    }

    await db.news.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Artículo borrado correctamente" });
  } catch (error: any) {
    console.error("Error al borrar noticia:", error);
    return NextResponse.json(
      { error: "Error interno al eliminar el artículo de prensa" },
      { status: 500 }
    );
  }
}
