import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Calendar, Clock, MapPin, Trophy, Newspaper, ArrowRight, Mail, Phone } from "lucide-react";
import MatchesList from "@/components/MatchesList";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import NewsletterForm from "@/components/NewsletterForm";

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
      className="bg-slate-950 text-slate-100 font-outfit"
      style={{
        "--primary-club": primaryColor,
        "--secondary-club": secondaryColor,
      } as React.CSSProperties}
    >
      {/* ---------------- SECCIÓN HERO / PORTADA SPORTS MAGAZINE ---------------- */}
      <section className="relative min-h-[75vh] flex items-center justify-center py-24 px-6 overflow-hidden border-b border-slate-900">
        
        {/* Fondo del Hero (Imagen con Efecto Oscuro Especial) */}
        {club.heroImages.length > 0 ? (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 scale-102" 
            style={{ backgroundImage: `url(${club.heroImages[0].imageUrl})` }}
          >
            {/* Gradientes deportivo-charcoal agresivo */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/95"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950">
            {/* Textura de red deportiva */}
            <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
          </div>
        )}

        {/* Líneas diagonales de movimiento deportivo en el fondo */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-1 bg-gradient-to-b from-transparent via-[var(--primary-club)] to-transparent h-full rotate-12 transform scale-150"></div>
          <div className="absolute top-0 right-1/4 w-0.5 bg-gradient-to-b from-transparent via-blue-500 to-transparent h-full rotate-12 transform scale-150"></div>
        </div>

        <div className="relative max-w-4xl w-full mx-auto text-center space-y-8 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--primary-club)] animate-ping"></span>
            <span className="text-[10px] uppercase font-black tracking-widest text-[var(--primary-club)]">
              Portal Oficial Olimpo
            </span>
          </div>

          <h1 className="font-outfit font-black text-5xl sm:text-7xl lg:text-8xl uppercase tracking-tight text-white leading-none italic drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
            {club.settings?.heroTitle || `Club Atlético ${club.name}`}
          </h1>

          <p className="font-sans text-sm sm:text-lg text-slate-350 max-w-2xl mx-auto leading-relaxed font-medium">
            {club.settings?.heroSubtitle || "Bienvenidos al portal de noticias, fixture e información institucional de nuestra comunidad."}
          </p>

          <div className="pt-4">
            <Link
              href={`/apply`}
              style={{ backgroundColor: primaryColor }}
              className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-xs font-black uppercase tracking-wider rounded-full text-white hover:brightness-110 shadow-2xl shadow-[var(--primary-club)]/20 hover:shadow-[var(--primary-club)]/40 hover:-translate-y-1 hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              Hacete Socio
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- SECCIÓN CENTRAL: PRENSA & FIXTURE ---------------- */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-3 gap-16">
        
        {/* COLUMNA DE NOTICIAS (2/3 ancho) */}
        <div className="lg:col-span-2 space-y-10">
          <div className="flex justify-between items-end border-b border-slate-850 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-club)]">
                Novedades de la Institución
              </span>
              <h2 className="font-outfit font-black text-3xl uppercase tracking-tight text-white mt-1 flex items-center italic">
                <Newspaper className="mr-3 text-[var(--primary-club)] h-7 w-7" />
                Prensa Oficial
              </h2>
            </div>
            <Link 
              href={`/news`}
              className="text-xs font-black uppercase tracking-wider text-[var(--primary-club)] hover:underline inline-flex items-center gap-1.5"
            >
              Ver Todas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {club.news.length === 0 ? (
            <div className="p-12 bg-slate-900/40 border border-slate-855 rounded-3xl text-center text-slate-500 text-sm shadow-sm">
              No hay novedades publicadas en este momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {club.news.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-slate-900/40 border border-slate-850 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-[var(--primary-club)]/10 hover:border-[var(--primary-club)]/30 transition-all duration-350 group flex flex-col justify-between"
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
                          <span className="text-[9px] uppercase font-black text-[var(--primary-club)] bg-slate-950 border border-slate-850 px-2.5 py-1 rounded shadow-md">
                            {item.category || "General"}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="p-6 space-y-2">
                      {!item.imageUrl && (
                        <span className="text-[9px] uppercase font-black text-[var(--primary-club)] bg-slate-950 border border-slate-850 px-2.5 py-1 rounded shadow-md">
                          {item.category || "General"}
                        </span>
                      )}
                      <h3 className="font-outfit font-black text-lg text-white leading-snug group-hover:text-[var(--primary-club)] transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {item.summary || item.content}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-slate-850 mt-4 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-bold">
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("es-AR") : ""}
                    </span>
                    <Link
                      href={`/news?newsId=${item.id}`}
                      className="font-black uppercase tracking-wider text-[10px] text-[var(--primary-club)] hover:underline inline-flex items-center"
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
        <div className="space-y-10">
          <div className="border-b border-slate-850 pb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-club)]">
              Agenda y Competencias
            </span>
            <h2 className="font-outfit font-black text-3xl uppercase tracking-tight text-white mt-1 flex items-center italic">
              <Trophy className="mr-3 text-[var(--primary-club)] h-7 w-7" />
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
      
      {/* ---------------- SECCIÓN: CONTACTO E INSTALACIONES ---------------- */}
      <section className="bg-slate-900/30 py-24 border-t border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-16 items-center">
          {/* Info de contacto */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-club)]">
                ¿Tenés consultas?
              </span>
              <h2 className="font-outfit font-black text-3xl sm:text-4xl uppercase tracking-tight text-white mt-1 italic">
                Contacto Oficial
              </h2>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Comunicate con la secretaría de nuestra institución para consultas administrativas, aranceles de disciplinas, alquiler de instalaciones o propuestas comerciales.
            </p>
            
            <div className="space-y-4 pt-6 border-t border-slate-850">
              {club.settings?.contactEmail && (
                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-full bg-[var(--primary-club)]/10 text-[var(--primary-club)] flex items-center justify-center shrink-0 border border-[var(--primary-club)]/20">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-black text-slate-500 tracking-wider">Correo Electrónico</span>
                    <span className="text-sm font-black text-slate-205">{club.settings.contactEmail}</span>
                  </div>
                </div>
              )}
              {club.settings?.contactPhone && (
                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-full bg-[var(--primary-club)]/10 text-[var(--primary-club)] flex items-center justify-center shrink-0 border border-[var(--primary-club)]/20">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-black text-slate-500 tracking-wider">Teléfono Secretaría</span>
                    <span className="text-sm font-black text-slate-205">{club.settings.contactPhone}</span>
                  </div>
                </div>
              )}
              {club.settings?.addressText && (
                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-full bg-[var(--primary-club)]/10 text-[var(--primary-club)] flex items-center justify-center shrink-0 border border-[var(--primary-club)]/20">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-black text-slate-500 tracking-wider">Ubicación Sede Central</span>
                    <span className="text-sm font-black text-slate-205 leading-snug">{club.settings.addressText}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Formulario de Contacto */}
          <div className="lg:col-span-3">
            <ContactForm clubId={club.id} primaryColor={primaryColor} />
          </div>
        </div>
      </section>

      {/* ---------------- SECCIÓN: BOLETÍN / NEWSLETTER ---------------- */}
      <section className="py-24 px-6 border-b border-slate-900 bg-slate-950">
        <NewsletterForm clubId={club.id} primaryColor={primaryColor} />
      </section>

      {/* ---------------- SECCIÓN SPONSORS PREMIUM ---------------- */}
      {club.sponsors.length > 0 && (
        <section className="bg-slate-950 py-20 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            <div className="text-center space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                Sponsors Oficiales
              </span>
              <h3 className="font-outfit font-black text-2xl text-white uppercase italic">
                Acompañan Nuestra Institución
              </h3>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
              {club.sponsors.map((sponsor) => (
                <div 
                  key={sponsor.id} 
                  className="h-10 md:h-12 flex items-center justify-center opacity-45 hover:opacity-100 transition-all duration-300 transform hover:scale-105 filter grayscale invert brightness-200"
                >
                  <img
                    src={sponsor.logoColorUrl}
                    alt={sponsor.name}
                    className="max-h-full max-w-[150px] object-contain"
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
