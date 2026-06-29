import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Newspaper, ArrowLeft, Calendar, Image as ImageIcon, ChevronRight, X, Heart } from "lucide-react";
import Link from "next/link";

interface NewsPageProps {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<{ tab?: string; newsId?: string; albumId?: string }>;
}

async function getClubNews(slug: string) {
  const club = await db.club.findUnique({
    where: { slug: slug.toLowerCase().trim() },
    include: {
      settings: true,
      news: {
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
      },
      photoAlbums: {
        where: { isActive: true },
        include: {
          photos: {
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return club;
}

export default async function ClubNewsPage({ params, searchParams }: NewsPageProps) {
  const { subdomain } = await params;
  const { tab = "news", newsId, albumId } = await searchParams;
  const club = await getClubNews(subdomain);

  if (!club) {
    return notFound();
  }

  const primaryColor = club.settings?.primaryColor || "#0284c7";
  const secondaryColor = club.settings?.secondaryColor || "#0f172a";

  // Buscar artículo seleccionado para el visor modal
  const selectedNews = newsId ? club.news.find((n) => n.id === newsId) : null;

  // Buscar álbum seleccionado para el visor modal
  const selectedAlbum = albumId ? club.photoAlbums.find((a) => a.id === albumId) : null;

  return (
    <div 
      className="bg-slate-50 min-h-screen text-slate-800 pb-20 font-outfit"
      style={{
        "--primary-club": primaryColor,
        "--secondary-club": secondaryColor,
      } as React.CSSProperties}
    >
      {/* Cabecera Estilo Club */}
      <header className="bg-slate-900 text-white py-14 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-gradient-to-r from-blue-900 to-slate-950"></div>
        <div className="relative max-w-5xl mx-auto space-y-4">
          <Link
            href={`/`}
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver al Inicio
          </Link>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
            Prensa y Multimedia
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-xl">
            Sigue las últimas novedades de la institución, comunicados de comisión directiva y las galerías de fotos oficiales.
          </p>
        </div>
      </header>

      {/* Tabs Selector de Secciones */}
      <div className="bg-white border-b border-slate-200 sticky top-20 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 flex gap-8">
          <Link
            href={`?tab=news`}
            className={`flex items-center py-4 text-sm font-black uppercase tracking-wider border-b-4 transition-colors ${
              tab === "news" ? "border-[var(--primary-club)] text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Newspaper className="h-4 w-4 mr-2" />
            Noticias & Comunicados
          </Link>
          <Link
            href={`?tab=albums`}
            className={`flex items-center py-4 text-sm font-black uppercase tracking-wider border-b-4 transition-colors ${
              tab === "albums" ? "border-[var(--primary-club)] text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Galerías de Fotos
          </Link>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {/* ======================= TAB: NOTICIAS ======================= */}
        {tab === "news" && (
          <div>
            {club.news.length === 0 ? (
              <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center text-slate-400 text-sm shadow-sm">
                No se han publicado comunicados de prensa en la web.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {club.news.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                  >
                    <div>
                      {item.imageUrl && (
                        <div className="h-56 overflow-hidden relative">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                          />
                        </div>
                      )}
                      
                      <div className="p-6 space-y-3">
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="text-[10px] uppercase font-black text-[var(--primary-club)] bg-[var(--primary-club)]/5 px-2.5 py-0.5 rounded border border-[var(--primary-club)]/10">
                            {item.category || "Institucional"}
                          </span>
                          {item.publishedAt && (
                            <span className="flex items-center font-bold">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              {new Date(item.publishedAt).toLocaleDateString("es-AR")}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-black text-xl text-slate-950 leading-snug group-hover:text-[var(--primary-club)] transition-colors">
                          {item.title}
                        </h3>
                        
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                          {item.summary || item.content}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 text-right">
                      <Link 
                        href={`?tab=news&newsId=${item.id}`}
                        className="text-xs font-black uppercase text-[var(--primary-club)] hover:underline inline-flex items-center tracking-wider"
                      >
                        Leer Artículo Completo <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB: ÁLBUMES DE FOTOS ======================= */}
        {tab === "albums" && (
          <div>
            {club.photoAlbums.length === 0 ? (
              <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center text-slate-400 text-sm shadow-sm">
                No hay galerías de fotos creadas todavía en la web.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {club.photoAlbums.map((album) => (
                  <Link
                    href={`?tab=albums&albumId=${album.id}`}
                    key={album.id}
                    className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      {/* Portada */}
                      <div 
                        className="h-48 bg-cover bg-center relative" 
                        style={{ backgroundImage: `url(${album.coverImageUrl || "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=800&auto=format&fit=crop&q=80"})` }}
                      >
                        <div className="absolute top-4 right-4 bg-slate-900/85 backdrop-blur-sm text-blue-400 border border-slate-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg">
                          {album.photos?.length || 0} Fotos
                        </div>
                      </div>
                      <div className="p-6 space-y-2">
                        <h3 className="text-lg font-black text-slate-950 group-hover:text-[var(--primary-club)] transition-colors truncate">{album.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{album.description || "Explora las fotos de este álbum oficial."}</p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 mt-4">
                      <span>Publicado</span>
                      <span className="text-[var(--primary-club)] flex items-center uppercase tracking-wider text-[10px] font-black">
                        Ver Galería <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ======================= VISOR MODAL: DETALLE DE NOTICIA ======================= */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            {/* Header del Modal */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <span className="text-[10px] uppercase font-black text-[var(--primary-club)] bg-[var(--primary-club)]/5 px-2.5 py-0.5 rounded border border-[var(--primary-club)]/10">
                {selectedNews.category || "Institucional"}
              </span>
              <Link 
                href={`?tab=news`}
                className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </Link>
            </div>

            {/* Contenido Scrollable */}
            <div className="overflow-y-auto p-6 space-y-6 flex-grow">
              {selectedNews.imageUrl && (
                <img 
                  src={selectedNews.imageUrl} 
                  alt={selectedNews.title} 
                  className="w-full h-64 object-cover rounded-2xl shadow-sm"
                />
              )}
              <div className="space-y-2">
                <div className="flex items-center text-xs text-slate-400 gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="font-bold">{new Date(selectedNews.publishedAt || selectedNews.createdAt).toLocaleDateString("es-AR")}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-950 leading-tight">
                  {selectedNews.title}
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-bold leading-relaxed border-l-4 border-[var(--primary-club)] pl-3 italic">
                {selectedNews.summary}
              </p>
              <div className="text-sm text-slate-650 leading-relaxed whitespace-pre-line space-y-4">
                {selectedNews.content}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50 text-xs font-bold text-slate-400">
              <span>© {club.name} Oficial</span>
              <Link
                href={`?tab=news`}
                className="px-5 py-2.5 bg-slate-950 text-white rounded-full hover:bg-slate-800 transition-colors uppercase tracking-wider text-[10px] font-black"
              >
                Cerrar Lector
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ======================= VISOR MODAL: GALERÍA DE ÁLBUM ======================= */}
      {selectedAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            
            {/* Header del Modal */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
              <div>
                <h3 className="text-lg font-black text-white">{selectedAlbum.title}</h3>
                <p className="text-xs text-slate-400 truncate max-w-lg mt-0.5">{selectedAlbum.description}</p>
              </div>
              <Link 
                href={`?tab=albums`}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Link>
            </div>

            {/* Cuadrícula de fotos */}
            <div className="overflow-y-auto p-6 flex-grow">
              {selectedAlbum.photos.length === 0 ? (
                <p className="text-center text-slate-500 py-12 text-sm">Este álbum no contiene fotos todavía.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {selectedAlbum.photos.map((photo: any) => (
                    <div 
                      key={photo.id}
                      className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-lg"
                    >
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src={photo.imageUrl} 
                          alt={photo.caption || "Foto del álbum"} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {photo.caption && (
                        <div className="p-3 bg-slate-950 text-center">
                          <p className="text-xs text-slate-300 font-medium leading-normal italic">
                            "{photo.caption}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800 flex justify-between items-center bg-slate-950/60 text-xs font-bold text-slate-400">
              <span className="flex items-center text-blue-400 uppercase tracking-widest text-[10px] font-black">
                <Heart className="h-3.5 w-3.5 mr-1 fill-blue-400" /> Olimpo Multimedia
              </span>
              <Link
                href={`?tab=albums`}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors uppercase tracking-wider text-[10px] font-black"
              >
                Volver a Álbumes
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
