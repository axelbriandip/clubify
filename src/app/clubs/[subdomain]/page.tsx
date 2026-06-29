import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Calendar, Clock, MapPin, Trophy, Newspaper, Heart, Mail, Phone } from "lucide-react";

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
        take: 4,
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

  // Si el club con ese slug/subdominio no existe en nuestra DB, retornar error 404
  if (!club) {
    return notFound();
  }

  // Paleta de colores configurada por el club
  const primaryColor = club.settings?.primaryColor || "#0284c7";
  const secondaryColor = club.settings?.secondaryColor || "#0f172a";
  
  // Agrupar sponsors por jerarquía para la V1 (Jerarquías Pro en el futuro)
  const platinumSponsors = club.sponsors.filter((s) => s.tier === "PLATINUM");
  const goldSponsors = club.sponsors.filter((s) => s.tier === "GOLD");
  const silverSponsors = club.sponsors.filter((s) => s.tier === "SILVER");

  return (
    <div 
      className="bg-white min-h-screen text-slate-800"
      style={{
        // Inyectamos las CSS variables para adaptar los botones y detalles a los colores del club
        "--primary-club": primaryColor,
        "--secondary-club": secondaryColor,
      } as React.CSSProperties}
    >
      {/* ---------------- SECCIÓN HERO / PORTADA ---------------- */}
      <section className="relative bg-slate-900 text-white py-24 px-6 overflow-hidden">
        {/* Imagen de fondo del Hero (Fija la primera imagen activa) */}
        {club.heroImages.length > 0 ? (
          <div className="absolute inset-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: `url(${club.heroImages[0].imageUrl})` }}></div>
        ) : (
          <div className="absolute inset-0 opacity-15 bg-gradient-to-r from-blue-900 to-slate-950"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

        <div className="relative max-w-5xl mx-auto text-center space-y-6 z-10">
          <span className="text-xs uppercase tracking-widest font-black px-3 py-1.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
            Sitio Oficial
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white drop-shadow-md">
            {club.settings?.heroTitle || `Club Atlético ${club.name}`}
          </h1>
          <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto font-medium drop-shadow">
            {club.settings?.heroSubtitle || "Bienvenidos al portal de noticias, fixture e información institucional de nuestra comunidad."}
          </p>
          {club.settings?.heroCtaText && (
            <div className="pt-4">
              <a
                href={club.settings.heroCtaLink || "#"}
                className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-base font-extrabold rounded-full text-white bg-[var(--primary-club)] hover:brightness-110 shadow-lg shadow-[var(--primary-club)]/20 transition-all transform hover:-translate-y-0.5"
              >
                {club.settings.heroCtaText}
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ---------------- SECCIÓN CENTRAL: NOTICIAS & FIXTURE ---------------- */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* COLUMNA 1 & 2: ÚLTIMAS NOTICIAS (PRENSA) */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-black uppercase tracking-wider text-slate-900 flex items-center border-b-2 border-slate-100 pb-3">
            <Newspaper className="mr-2 text-[var(--primary-club)] h-6 w-6" />
            Últimas Novedades
          </h2>

          {club.news.length === 0 ? (
            <div className="p-8 bg-slate-50 border border-slate-100 rounded-2xl text-center text-slate-400 text-sm">
              No hay noticias publicadas en este momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {club.news.map((item) => (
                <div key={item.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
                  <div>
                    {item.imageUrl && (
                      <div className="h-48 bg-cover bg-center overflow-hidden">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-5 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-[var(--primary-club)] bg-[var(--primary-club)]/5 px-2 py-0.5 rounded">
                        {item.category || "Institucional"}
                      </span>
                      <h3 className="font-extrabold text-lg text-slate-950 leading-snug group-hover:text-[var(--primary-club)] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-3">
                        {item.summary || item.content}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 text-right">
                    <button className="text-xs font-bold text-[var(--primary-club)] hover:underline inline-flex items-center">
                      Leer Más <ChevronRight className="h-3 w-3 ml-0.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUMNA 3: FIXTURE & PARTIDOS */}
        <div className="space-y-8">
          <h2 className="text-2xl font-black uppercase tracking-wider text-slate-900 flex items-center border-b-2 border-slate-100 pb-3">
            <Trophy className="mr-2 text-[var(--primary-club)] h-6 w-6" />
            Agenda Deportiva
          </h2>

          {club.matches.length === 0 ? (
            <div className="p-8 bg-slate-50 border border-slate-100 rounded-2xl text-center text-slate-400 text-sm">
              No hay partidos programados recientemente.
            </div>
          ) : (
            <div className="space-y-4">
              {club.matches.map((match) => (
                <div key={match.id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-200/60 pb-2">
                    <span className="font-bold text-[var(--primary-club)]">
                      {match.category.discipline.name} - {match.category.name}
                    </span>
                    <span>
                      {new Date(match.matchDate).toLocaleDateString("es-AR")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                    <span className={match.homeTeam.isOwnClub ? "text-[var(--primary-club)]" : ""}>
                      {match.homeTeam.name}
                    </span>
                    {match.status === "FINISHED" ? (
                      <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded text-xs font-black">
                        {match.homeScore} - {match.awayScore}
                      </span>
                    ) : (
                      <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded uppercase">
                        vs
                      </span>
                    )}
                    <span className={match.awayTeam.isOwnClub ? "text-[var(--primary-club)]" : ""}>
                      {match.awayTeam.name}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 flex items-center pt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {match.facility ? match.facility.name : (match.customLocationName || "Cancha rival")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------------- SECCIÓN: SPONSORS / PATROCINADORES ---------------- */}
      {club.sponsors.length > 0 && (
        <section className="bg-slate-50 py-16 border-t border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 space-y-8">
            <h3 className="text-center text-sm font-bold uppercase tracking-widest text-slate-400">
              Acompañan nuestra institución
            </h3>
            
            {/* Sponsors Grid */}
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {club.sponsors.map((sponsor) => (
                <div key={sponsor.id} className="h-12 md:h-16 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
                  <img
                    src={sponsor.logoColorUrl}
                    alt={sponsor.name}
                    className="max-h-full max-w-[150px] object-contain filter grayscale hover:grayscale-0 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- CONTACTO & PIE DE PÁGINA PÚBLICO ---------------- */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-slate-900 pb-10 mb-10">
          
          <div className="space-y-4">
            <h4 className="text-white font-black uppercase text-lg tracking-wider">
              {club.name}
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Sitio web oficial de la institución autogenerado bajo la red de Clubify. 
              Fomentando el deporte y la comunidad.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase text-sm tracking-wider">
              Contacto Oficial
            </h4>
            <ul className="space-y-2.5 text-sm">
              {club.settings?.contactEmail && (
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-[var(--primary-club)]" />
                  {club.settings.contactEmail}
                </li>
              )}
              {club.settings?.contactPhone && (
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-[var(--primary-club)]" />
                  {club.settings.contactPhone}
                </li>
              )}
              {club.settings?.addressText && (
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-[var(--primary-club)]" />
                  {club.settings.addressText}
                </li>
              )}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-bold uppercase text-sm tracking-wider">
              Enlaces de Interés
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <a href="#" className="hover:text-white transition-colors">Disciplinas</a>
              <a href="#" className="hover:text-white transition-colors">Fixture</a>
              <a href="#" className="hover:text-white transition-colors">Prensa</a>
              <a href="#" className="hover:text-white transition-colors">Socios</a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} {club.name.toUpperCase()}. Todos los derechos reservados.</p>
          <p className="flex items-center">
            Desarrollado con <Heart className="h-3 w-3 mx-1 text-red-500 fill-red-500" /> por Clubify.
          </p>
        </div>
      </footer>
    </div>
  );
}
