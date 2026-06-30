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
      className="bg-slate-50 min-h-screen text-slate-900 pb-20 font-sans"
      style={{
        "--primary-club": primaryColor,
        "--secondary-club": secondaryColor,
      } as React.CSSProperties}
    >
      {/* Cabecera Estilo Club */}
      <header className="bg-slate-900 text-white py-14 px-6 relative overflow-hidden border-b-4 border-slate-900">
        <div className="absolute inset-0 opacity-40 bg-[var(--primary-club)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
        <div className="relative max-w-5xl mx-auto space-y-4 z-10">
          <Link
            href={`/`}
            className="inline-flex items-center text-xs font-black uppercase font-oswald text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver al Inicio
          </Link>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic font-oswald drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">
            Prensa y Multimedia
          </h1>
          <p className="text-xs md:text-sm text-slate-200 max-w-xl font-bold uppercase tracking-wider font-oswald">
            Sigue las últimas novedades de la institución, comunicados de comisión directiva y las galerías de fotos oficiales.
          </p>
        </div>
      </header>

      {/* Tabs Selector de Secciones Brutalista */}
      <div className="bg-white border-b-4 border-slate-900 sticky top-20 z-40 shadow-md">
        <div className="max-w-5xl mx-auto px-6 flex gap-8">
          <Link
            href={`?tab=news`}
            className={`flex items-center py-4 text-sm font-black uppercase tracking-widest border-b-4 transition-colors font-oswald ${
              tab === "news" ? "border-[var(--primary-club)] text-slate-900 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <Newspaper className="h-4 w-4 mr-2 text-[var(--primary-club)]" />
            Noticias & Comunicados
          </Link>
          <Link
            href={`?tab=albums`}
            className={`flex items-center py-4 text-sm font-black uppercase tracking-widest border-b-4 transition-colors font-oswald ${
              tab === "albums" ? "border-[var(--primary-club)] text-slate-900 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            <ImageIcon className="h-4 w-4 mr-2 text-[var(--primary-club)]" />
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
              <div className="bg-white border-2 border-slate-900 border-dashed p-12 text-center text-slate-500 text-xs font-bold font-oswald uppercase tracking-wider">
                No se han publicado comunicados de prensa en la web.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {club.news.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--primary-club)] transition-all duration-150 flex flex-col justify-between group"
                  >
                    <div>
                      {item.imageUrl && (
                        <div className="h-56 overflow-hidden relative border-b-2 border-slate-900">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      <div className="p-6 space-y-3">
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-bold font-oswald uppercase">
                          <span className="text-[9px] uppercase font-black text-slate-900 bg-white border-2 border-slate-900 px-2.5 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {item.category || "Institucional"}
                          </span>
                          {item.publishedAt && (
                            <span className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1 text-[var(--primary-club)]" />
                              {new Date(item.publishedAt).toLocaleDateString("es-AR")}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-oswald font-black text-xl text-slate-900 leading-snug group-hover:text-[var(--primary-club)] transition-colors uppercase">
                          {item.title}
                        </h3>
                        
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {item.summary || item.content}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 text-right mt-4 border-t border-slate-100 pt-4">
                      <Link 
                        href={`?tab=news&newsId=${item.id}`}
                        className="text-xs font-black uppercase text-[var(--primary-club)] hover:underline inline-flex items-center tracking-wider font-oswald"
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
              <div className="bg-white border-2 border-slate-900 border-dashed p-12 text-center text-slate-500 text-xs font-bold font-oswald uppercase tracking-wider">
                No hay galerías de fotos creadas todavía en la web.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {club.photoAlbums.map((album) => (
                  <Link
                    href={`?tab=albums&albumId=${album.id}`}
                    key={album.id}
                    className="bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--primary-club)] transition-all duration-150 flex flex-col justify-between group cursor-pointer"
                  >
                    <div>
                      {/* Portada */}
                      <div 
                        className="h-48 bg-cover bg-center relative border-b-2 border-slate-900" 
                        style={{ backgroundImage: `url(${album.coverImageUrl || "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=800&auto=format&fit=crop&q=80"})` }}
                      >
                        <div className="absolute top-4 right-4 bg-slate-900 text-white text-[10px] font-black uppercase px-2.5 py-1 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-oswald">
                          {album.photos?.length || 0} Fotos
                        </div>
                      </div>
                      <div className="p-6 space-y-2">
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-[var(--primary-club)] transition-colors truncate font-oswald uppercase">{album.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{album.description || "Explora las fotos de este álbum oficial."}</p>
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 mt-4 pt-4">
                      <span className="font-oswald uppercase text-[10px]">Publicado</span>
                      <span className="text-[var(--primary-club)] flex items-center font-black uppercase font-oswald text-[10px]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border-4 border-slate-900 w-full max-w-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative max-h-[90vh] flex flex-col text-slate-850">
            {/* Header del Modal */}
            <div className="p-6 border-b-2 border-slate-900 flex justify-between items-center bg-slate-50">
              <span className="text-[9px] uppercase font-black text-slate-900 bg-white border-2 border-slate-900 px-2.5 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-oswald">
                {selectedNews.category || "Institucional"}
              </span>
              <Link 
                href={`?tab=news`}
                className="p-1.5 border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-colors text-slate-900"
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
                  className="w-full h-64 object-cover border-2 border-slate-900 shadow-md"
                />
              )}
              <div className="space-y-1">
                <div className="flex items-center text-xs text-slate-405 gap-1.5 font-oswald font-bold uppercase">
                  <Calendar className="h-3.5 w-3.5 text-[var(--primary-club)]" />
                  <span>{new Date(selectedNews.publishedAt || selectedNews.createdAt).toLocaleDateString("es-AR")}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight font-oswald uppercase">
                  {selectedNews.title}
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-bold leading-relaxed border-l-4 border-[var(--primary-club)] pl-3 italic">
                {selectedNews.summary}
              </p>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line space-y-4 font-semibold">
                {selectedNews.content}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t-2 border-slate-900 flex justify-between items-center bg-slate-50 text-xs font-bold text-slate-400">
              <span className="font-oswald uppercase">© {club.name} Oficial</span>
              <Link
                href={`?tab=news`}
                className="px-5 py-2.5 bg-slate-900 border-2 border-slate-900 text-white hover:bg-white hover:text-slate-900 transition-colors uppercase tracking-wider text-[10px] font-black font-oswald shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Cerrar Lector
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ======================= VISOR MODAL: GALERÍA DE ÁLBUM ======================= */}
      {selectedAlbum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border-4 border-slate-900 w-full max-w-4xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative max-h-[90vh] flex flex-col">
            
            {/* Header del Modal */}
            <div className="p-6 border-b-2 border-slate-800 flex justify-between items-center bg-slate-950/60">
              <div>
                <h3 className="text-lg font-black text-white font-oswald uppercase">{selectedAlbum.title}</h3>
                <p className="text-xs text-slate-350 truncate max-w-lg mt-0.5 font-medium">{selectedAlbum.description}</p>
              </div>
              <Link 
                href={`?tab=albums`}
                className="p-2 border-2 border-slate-800 hover:bg-white hover:text-slate-900 text-slate-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </Link>
            </div>

            {/* Cuadrícula de fotos */}
            <div className="overflow-y-auto p-6 flex-grow">
              {selectedAlbum.photos.length === 0 ? (
                <p className="text-center text-slate-500 py-12 text-sm font-oswald font-black uppercase">Este álbum no contiene fotos todavía.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {selectedAlbum.photos.map((photo: any) => (
                    <div 
                      key={photo.id}
                      className="bg-slate-950 border-2 border-slate-900 overflow-hidden shadow-lg"
                    >
                      <div className="h-48 overflow-hidden relative">
                        <img 
                          src={photo.imageUrl} 
                          alt={photo.caption || "Foto del álbum"} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {photo.caption && (
                        <div className="p-3 bg-slate-950 text-center border-t border-slate-900">
                          <p className="text-xs text-slate-350 font-bold leading-normal italic">
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
            <div className="p-6 border-t-2 border-slate-800 flex justify-between items-center bg-slate-950/60 text-xs font-bold text-slate-450">
              <span className="flex items-center text-[var(--primary-club)] font-black uppercase tracking-widest text-[10px] font-oswald">
                <Heart className="h-3.5 w-3.5 mr-1 fill-[var(--primary-club)]" /> Olimpo Multimedia
              </span>
              <Link
                href={`?tab=albums`}
                className="px-5 py-2.5 bg-[var(--primary-club)] border-2 border-slate-900 text-white hover:brightness-110 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider text-[10px] font-black font-oswald"
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
