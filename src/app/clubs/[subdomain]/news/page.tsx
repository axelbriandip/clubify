import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Newspaper, ArrowLeft, Calendar, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

interface NewsPageProps {
  params: Promise<{ subdomain: string }>;
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
    },
  });

  return club;
}

export default async function ClubNewsPage({ params }: NewsPageProps) {
  const { subdomain } = await params;
  const club = await getClubNews(subdomain);

  if (!club) {
    return notFound();
  }

  const primaryColor = club.settings?.primaryColor || "#0284c7";
  const secondaryColor = club.settings?.secondaryColor || "#0f172a";

  return (
    <div 
      className="bg-slate-50 min-h-screen text-slate-800 pb-20"
      style={{
        "--primary-club": primaryColor,
        "--secondary-club": secondaryColor,
      } as React.CSSProperties}
    >
      {/* Cabecera Estilo Club */}
      <header className="bg-slate-900 text-white py-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-blue-900 to-slate-950"></div>
        <div className="relative max-w-5xl mx-auto space-y-4">
          <Link
            href={`/`}
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver al Inicio
          </Link>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
            Prensa y Novedades
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-xl">
            Sigue de cerca toda la información institucional, crónicas de partidos y comunicados oficiales.
          </p>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {club.news.length === 0 ? (
          <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-400 text-sm shadow-sm">
            No se han publicado comunicados de prensa en la web.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {club.news.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between"
              >
                <div>
                  {item.imageUrl && (
                    <div className="h-56 bg-cover bg-center overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="text-[10px] uppercase font-bold text-[var(--primary-club)] bg-[var(--primary-club)]/5 px-2.5 py-0.5 rounded border border-[var(--primary-club)]/10">
                        {item.category || "Institucional"}
                      </span>
                      {item.publishedAt && (
                        <span className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {new Date(item.publishedAt).toLocaleDateString("es-AR")}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-extrabold text-xl text-slate-950 leading-snug group-hover:text-[var(--primary-club)] transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-4">
                      {item.summary || item.content}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 text-right">
                  <button className="text-xs font-bold text-[var(--primary-club)] hover:underline inline-flex items-center">
                    Leer Artículo Completo <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
