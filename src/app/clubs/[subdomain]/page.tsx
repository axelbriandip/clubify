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
      className="bg-slate-50 text-slate-805 font-sans pb-16"
      style={{
        "--primary-club": primaryColor,
        "--secondary-club": secondaryColor,
      } as React.CSSProperties}
    >
      {/* ---------------- SECCIÓN HERO: BIENVENIDA LIMPIA Y PREMIUM ---------------- */}
      <section className="relative min-h-[50vh] flex items-center justify-center py-20 px-6 overflow-hidden border-b border-slate-100 bg-gradient-to-tr from-[var(--secondary-club)]/5 via-[var(--primary-club)]/10 to-[var(--secondary-club)]/5">
        
        {/* Fondo del Hero (Imagen con Overlay Suave) */}
        {club.heroImages.length > 0 ? (
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700" 
            style={{ backgroundImage: `url(${club.heroImages[0].imageUrl})` }}
          >
            {/* Overlay degradado limpio */}
            <div className="absolute inset-0 bg-slate-950/70"></div>
          </div>
        ) : (
          <div className="absolute inset-0">
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>
        )}

        <div className="relative max-w-4xl w-full mx-auto text-center space-y-6 z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/10 border border-slate-900/20 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[var(--primary-club)] animate-pulse"></span>
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-700">
              Sitio Oficial
            </span>
          </div>

          <h1 className={`font-outfit font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tight leading-none ${club.heroImages.length > 0 ? 'text-white drop-shadow-md' : 'text-slate-900'}`}>
            {club.settings?.heroTitle || `Club Atlético ${club.name}`}
          </h1>

          <p className={`font-sans text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-semibold ${club.heroImages.length > 0 ? 'text-slate-200' : 'text-slate-650'}`}>
            {club.settings?.heroSubtitle || "Bienvenidos al portal de noticias, fixture e información institucional de nuestra comunidad."}
          </p>

          <div className="pt-4">
            <Link
              href={`/apply`}
              style={{ backgroundColor: primaryColor }}
              className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-xs font-black uppercase tracking-wider rounded-full text-white hover:brightness-110 shadow-lg shadow-[var(--primary-club)]/15 hover:shadow-[var(--primary-club)]/25 hover:-translate-y-0.5 hover:scale-103 transition-all duration-200 cursor-pointer"
            >
              Hacete Socio
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- GRILLA PRINCIPAL: PANTALLA DIVIDIDA ESPORTS ARENA ---------------- */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* COLUMNA FIXTURE & PARTIDOS (7 Columnas a la Izquierda) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="border-b border-slate-250 pb-3 flex items-center justify-between">
            <h2 className="font-outfit font-black text-2xl uppercase tracking-tight text-slate-900 flex items-center">
              <Trophy className="mr-2.5 text-[var(--primary-club)] h-6 w-6" />
              Fixture y Partidos
            </h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-club)]">
              Marcadores Oficiales
            </span>
          </div>

          <MatchesList 
            initialMatches={club.matches} 
            clubSlug={club.slug} 
            clubName={club.name} 
          />
        </div>

        {/* COLUMNA PRENSA OFICIAL (5 Columnas a la Derecha - Compacta) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="border-b border-slate-250 pb-3 flex justify-between items-end">
            <h2 className="font-outfit font-black text-2xl uppercase tracking-tight text-slate-900 flex items-center">
              <Newspaper className="mr-2.5 text-[var(--primary-club)] h-6 w-6" />
              Prensa Oficial
            </h2>
            <Link 
              href={`/news`}
              className="text-xs font-bold text-[var(--primary-club)] hover:underline flex items-center"
            >
              Ver Todas <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>

          {club.news.length === 0 ? (
            <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center text-slate-400 text-xs shadow-sm">
              No hay novedades publicadas.
            </div>
          ) : (
            <div className="space-y-6">
              {club.news.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[var(--primary-club)]/20 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {item.imageUrl && (
                      <div className="h-44 overflow-hidden relative">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="text-[9px] uppercase font-black text-[var(--primary-club)] bg-white/95 backdrop-blur px-2.5 py-1 rounded shadow-sm border border-slate-100">
                            {item.category || "General"}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="p-5 space-y-2">
                      {!item.imageUrl && (
                        <span className="text-[9px] uppercase font-black text-[var(--primary-club)] bg-[var(--primary-club)]/5 px-2.5 py-1 rounded border border-[var(--primary-club)]/10">
                          {item.category || "General"}
                        </span>
                      )}
                      <h3 className="font-outfit font-black text-lg text-slate-900 leading-snug group-hover:text-[var(--primary-club)] transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-505 line-clamp-2 leading-relaxed">
                        {item.summary || item.content}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 mt-2 flex justify-between items-center text-xs border-t border-slate-100/60">
                    <span className="text-slate-400 font-semibold">
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("es-AR") : ""}
                    </span>
                    <Link
                      href={`/news?newsId=${item.id}`}
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
      </section>
      
      {/* ---------------- SECCIÓN: CONTACTO E INSTALACIONES ---------------- */}
      <section className="bg-slate-100/80 border-t border-b border-slate-200/60 py-16 mt-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          {/* Info de contacto */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-club)]">
                ¿Tenés consultas?
              </span>
              <h2 className="font-outfit font-black text-3xl text-slate-900 mt-1">
                Contacto Oficial
              </h2>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-semibold">
              Comunicate con la secretaría de nuestra institución para consultas administrativas, aranceles de disciplinas, alquiler de instalaciones o propuestas comerciales.
            </p>
            
            <div className="space-y-4 pt-4 border-t border-slate-200/65">
              {club.settings?.contactEmail && (
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-[var(--primary-club)]/10 text-[var(--primary-club)] flex items-center justify-center shrink-0">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-black text-slate-400 tracking-wider">Correo Electrónico</span>
                    <span className="text-sm font-semibold text-slate-800">{club.settings.contactEmail}</span>
                  </div>
                </div>
              )}
              {club.settings?.contactPhone && (
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-[var(--primary-club)]/10 text-[var(--primary-club)] flex items-center justify-center shrink-0">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-black text-slate-400 tracking-wider">Teléfono Secretaría</span>
                    <span className="text-sm font-semibold text-slate-800">{club.settings.contactPhone}</span>
                  </div>
                </div>
              )}
              {club.settings?.addressText && (
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-[var(--primary-club)]/10 text-[var(--primary-club)] flex items-center justify-center shrink-0">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-black text-slate-400 tracking-wider">Ubicación Sede Central</span>
                    <span className="text-sm font-semibold text-slate-800 leading-snug">{club.settings.addressText}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Formulario */}
          <div className="lg:col-span-3">
            <ContactForm clubId={club.id} primaryColor={primaryColor} />
          </div>
        </div>
      </section>

      {/* ---------------- SECCIÓN: BOLETÍN / NEWSLETTER ---------------- */}
      <section className="py-16 px-6 bg-white">
        <NewsletterForm clubId={club.id} primaryColor={primaryColor} />
      </section>

      {/* ---------------- SECCIÓN SPONSORS ---------------- */}
      {club.sponsors.length > 0 && (
        <section className="py-16 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6 space-y-10">
            <div className="text-center space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Sponsors Oficiales
              </span>
              <h3 className="font-outfit font-black text-xl text-slate-900 uppercase">
                Acompañan Nuestra Institución
              </h3>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-6">
              {club.sponsors.map((sponsor) => (
                <div 
                  key={sponsor.id} 
                  className="bg-white border border-slate-200/60 rounded-2xl p-4 flex items-center justify-center h-16 w-36 hover:scale-102 hover:shadow-md transition-all duration-200"
                >
                  <img
                    src={sponsor.logoColorUrl}
                    alt={sponsor.name}
                    className="max-h-full max-w-full object-contain"
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
