import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Calendar, Clock, MapPin, Trophy, Newspaper, ArrowRight } from "lucide-react";
import MatchesList from "@/components/MatchesList";
import Link from "next/link";

interface ClubPublicPageProps {
  params: Promise<{ subdomain: string }>;
}

async function getClubData(slug: string) {
  return await db.club.findUnique({
    where: { slug: slug.toLowerCase().trim() },
    include: {
      settings: true,
      heroImages: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      sponsors: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      news: {
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
      },
      matches: {
        take: 5,
        include: {
          homeTeam: true,
          awayTeam: true,
          category: {
            include: {
              discipline: true,
            },
          },
        },
        orderBy: { matchDate: "desc" },
      },
    },
  });
}

export default async function ClubPublicPage({ params }: ClubPublicPageProps) {
  const { subdomain } = await params;
  const club = await getClubData(subdomain);

  if (!club) {
    return notFound();
  }

  const primaryColor = club.settings?.primaryColor || "#0284c7";
  const secondaryColor = club.settings?.secondaryColor || "#0f172a";

  return (
    <div 
      className="bg-slate-50 text-slate-800"
      style={{
        "--primary-club": primaryColor,
        "--secondary-club": secondaryColor,
      } as React.CSSProperties}
    >
      {/* ---------------- SECCIÓN HERO / PORTADA PREMIUM ---------------- */}
      <section className="relative min-h-[60vh] flex items-center justify-center py-20 px-6 overflow-hidden">
        {/* Fondo del Hero */}
        {club.heroImages.length > 0 ? (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700" 
            style={{ backgroundImage: `url(${club.heroImages[0].imageUrl})` }}
          >
            {/* Overlay Oscuro con Gradiente para Legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-slate-950/90"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950">
            {/* Patrón de Red para dar textura deportiva */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--secondary-club)]/50 to-transparent"></div>
          </div>
        )}

        <div className="relative max-w-4xl w-full mx-auto text-center space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <span className="h-2 w-2 rounded-full bg-[var(--primary-club)] animate-pulse"></span>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-200">
              Sitio Oficial
            </span>
          </div>

          <h1 className="font-outfit font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight text-white leading-none">
            {club.settings?.heroTitle || `Club Atlético ${club.name}`}
          </h1>

          <p className="font-sans text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {club.settings?.heroSubtitle || "Bienvenidos al portal de noticias, fixture e información institucional de nuestra comunidad."}
          </p>

          {club.settings?.heroCtaText && (
            <div className="pt-4">
              <Link
                href={`/apply`}
                style={{ backgroundColor: primaryColor }}
                className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-xs font-black uppercase tracking-widest rounded-full text-white hover:brightness-110 shadow-lg shadow-[var(--primary-club)]/30 hover:shadow-[var(--primary-club)]/40 hover:-translate-y-0.5 hover:scale-105 transition-all duration-300"
              >
                {club.settings.heroCtaText}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ---------------- SECCIÓN CENTRAL: PRENSA & FIXTURE ---------------- */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* COLUMNA DE NOTICIAS (2/3 ancho) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-end border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-club)]">
                Novedades de la Institución
              </span>
              <h2 className="font-outfit font-black text-2xl uppercase tracking-tight text-slate-900 mt-1 flex items-center">
                <Newspaper className="mr-2.5 text-[var(--primary-club)] h-6 w-6" />
                Prensa Oficial
              </h2>
            </div>
            <Link 
              href={`/news`}
              className="text-xs font-bold text-[var(--primary-club)] hover:underline inline-flex items-center gap-1"
            >
              Ver Todas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {club.news.length === 0 ? (
            <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center text-slate-400 text-sm shadow-sm">
              No hay novedades publicadas en este momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {club.news.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    {item.imageUrl && (
                      <div className="h-52 bg-cover bg-center overflow-hidden relative">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="text-[9px] uppercase font-black text-[var(--primary-club)] bg-white/95 backdrop-blur px-2.5 py-1 rounded shadow-sm">
                            {item.category || "General"}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="p-6 space-y-2">
                      {!item.imageUrl && (
                        <span className="text-[9px] uppercase font-black text-[var(--primary-club)] bg-[var(--primary-club)]/5 px-2 py-0.5 rounded border border-[var(--primary-club)]/10">
                          {item.category || "General"}
                        </span>
                      )}
                      <h3 className="font-outfit font-black text-lg text-slate-900 leading-snug group-hover:text-[var(--primary-club)] transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {item.summary || item.content}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-50/50 mt-4 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("es-AR") : ""}
                    </span>
                    <Link
                      href={`/news`}
                      className="font-bold text-[var(--primary-club)] hover:underline inline-flex items-center"
                    >
                      Leer Más <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUMNA DE FIXTURE (1/3 ancho) */}
        <div className="space-y-8">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-club)]">
              Agenda y Competencias
            </span>
            <h2 className="font-outfit font-black text-2xl uppercase tracking-tight text-slate-900 mt-1 flex items-center">
              <Trophy className="mr-2.5 text-[var(--primary-club)] h-6 w-6" />
              Fixture y Partidos
            </h2>
          </div>

          <MatchesList 
            initialMatches={club.matches} 
            clubSlug={club.slug} 
            clubName={club.name} 
          />
        </div>
      </section>

      {/* ---------------- SECCIÓN SPONSORS PREMIUM ---------------- */}
      {club.sponsors.length > 0 && (
        <section className="bg-white py-16 border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-6 space-y-10">
            <div className="text-center space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Sponsors Oficiales
              </span>
              <h3 className="font-outfit font-black text-xl text-slate-900 uppercase">
                Acompañan Nuestra Institución
              </h3>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16">
              {club.sponsors.map((sponsor) => (
                <div 
                  key={sponsor.id} 
                  className="h-10 md:h-12 flex items-center justify-center opacity-40 hover:opacity-100 transition-all duration-300 transform hover:scale-102"
                >
                  <img
                    src={sponsor.logoColorUrl}
                    alt={sponsor.name}
                    className="max-h-full max-w-[140px] object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
