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
      className="bg-slate-50 text-slate-900 font-sans pb-16"
      style={{
        "--primary-club": primaryColor,
        "--secondary-club": secondaryColor,
      } as React.CSSProperties}
    >
      {/* ---------------- SECCIÓN HERO: PÓSTER SESGADO BRUTALISTA ---------------- */}
      <section className="relative px-6 pt-12 pb-24 overflow-hidden max-w-7xl mx-auto">
        <div 
          className="relative min-h-[50vh] border-4 border-slate-900 bg-white shadow-[8px_8px_0px_0px_var(--primary-club)] flex items-center justify-center p-8 md:p-16 overflow-hidden"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 92%, 0 100%)" }}
        >
          {/* Fondo del Hero (Imagen con Overlay Deportivo) */}
          {club.heroImages.length > 0 ? (
            <div 
              className="absolute inset-0 bg-cover bg-center transition-all duration-700" 
              style={{ backgroundImage: `url(${club.heroImages[0].imageUrl})` }}
            >
              {/* Overlay con color del club e inclinación */}
              <div className="absolute inset-0 bg-slate-950/80 mix-blend-multiply"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--primary-club)]/20 via-transparent to-slate-950/90"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--secondary-club)]/10 via-[var(--primary-club)]/20 to-[var(--secondary-club)]/10">
              <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]"></div>
            </div>
          )}

          {/* Símbolo gigante de agua en el fondo */}
          <div className="absolute right-0 bottom-0 text-[18rem] font-black uppercase font-oswald text-black/5 select-none tracking-tighter leading-none pointer-events-none translate-y-12 translate-x-12">
            {club.name.substring(0, 2)}
          </div>

          <div className="relative max-w-3xl w-full text-center space-y-6 z-10 py-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border-2 border-slate-900 bg-white text-slate-900 font-oswald font-black uppercase tracking-widest text-[9px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="h-2 w-2 rounded-full bg-[var(--primary-club)] animate-ping"></span>
              {club.name} Club Portal
            </div>

            <h1 className="font-oswald font-black text-4xl sm:text-6xl lg:text-7xl uppercase tracking-tighter leading-none italic text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              {club.settings?.heroTitle || `Club Atlético ${club.name}`}
            </h1>

            <p className="font-oswald font-bold text-sm sm:text-base text-slate-200 max-w-xl mx-auto uppercase tracking-wide">
              {club.settings?.heroSubtitle || "Bienvenidos al portal de noticias, fixture e información institucional de nuestra comunidad."}
            </p>

            <div className="pt-4">
              <Link
                href={`/apply`}
                style={{ backgroundColor: primaryColor }}
                className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-slate-900 text-xs font-black uppercase tracking-wider text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 cursor-pointer"
              >
                Hacete Socio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- GRILLA PRINCIPAL: PANTALLA DIVIDIDA ESPORTS ARENA ---------------- */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* COLUMNA FIXTURE & PARTIDOS (7 Columnas a la Izquierda) */}
        <div className="lg:col-span-7 space-y-8">
          <div className="border-b-4 border-slate-900 pb-3 flex items-center justify-between">
            <h2 className="font-oswald font-black text-3xl uppercase tracking-tight text-slate-900 flex items-center italic">
              <Trophy className="mr-2 text-[var(--primary-club)] h-7 w-7" />
              Fixture y Marcadores
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider font-oswald text-slate-500">
              Esports Arena
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
          <div className="border-b-4 border-slate-900 pb-3 flex justify-between items-end">
            <h2 className="font-oswald font-black text-3xl uppercase tracking-tight text-slate-900 flex items-center italic">
              <Newspaper className="mr-2 text-[var(--primary-club)] h-7 w-7" />
              Noticias
            </h2>
            <Link 
              href={`/news`}
              className="text-[10px] font-black uppercase tracking-wider text-[var(--primary-club)] hover:underline flex items-center font-oswald"
            >
              Ver Todas <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>

          {club.news.length === 0 ? (
            <div className="p-8 bg-white border-2 border-slate-900 border-dashed rounded-none text-center text-slate-500 text-xs font-bold font-oswald uppercase tracking-wider">
              Sin novedades publicadas
            </div>
          ) : (
            <div className="space-y-6">
              {club.news.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--primary-club)] transition-all duration-150 flex flex-col justify-between group"
                >
                  <div>
                    {item.imageUrl && (
                      <div className="h-44 overflow-hidden relative border-b-2 border-slate-900">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="text-[9px] uppercase font-black text-slate-900 bg-white border-2 border-slate-900 px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-oswald">
                            {item.category || "General"}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="p-5 space-y-2">
                      {!item.imageUrl && (
                        <span className="text-[9px] uppercase font-black text-slate-900 bg-white border-2 border-slate-900 px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-oswald">
                          {item.category || "General"}
                        </span>
                      )}
                      <h3 className="font-oswald font-black text-lg text-slate-900 leading-snug group-hover:text-[var(--primary-club)] transition-colors uppercase line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.summary || item.content}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 mt-2 flex justify-between items-center text-xs border-t border-slate-100">
                    <span className="text-slate-400 font-bold font-oswald uppercase text-[10px]">
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("es-AR") : ""}
                    </span>
                    <Link
                      href={`/news?newsId=${item.id}`}
                      className="font-black uppercase tracking-wider text-[10px] text-[var(--primary-club)] hover:underline inline-flex items-center font-oswald"
                    >
                      Leer Más <ArrowRight className="h-3 w-3 ml-0.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* ---------------- SECCIÓN: CONTACTO E INSTALACIONES (Brutalista) ---------------- */}
      <section className="bg-slate-100 border-t-4 border-b-4 border-slate-900 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
          {/* Info de contacto */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-club)] font-oswald">
                ¿Tenés consultas?
              </span>
              <h2 className="font-oswald font-black text-4xl uppercase tracking-tight text-slate-900 mt-1 italic">
                Contacto Oficial
              </h2>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-semibold">
              Comunicate con la secretaría de nuestra institución para consultas administrativas, aranceles de disciplinas, alquiler de instalaciones o propuestas comerciales.
            </p>
            
            <div className="space-y-4 pt-4 border-t-2 border-slate-900">
              {club.settings?.contactEmail && (
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 bg-white border-2 border-slate-900 text-slate-900 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-black text-slate-400 tracking-wider font-oswald">Correo Electrónico</span>
                    <span className="text-sm font-black text-slate-900">{club.settings.contactEmail}</span>
                  </div>
                </div>
              )}
              {club.settings?.contactPhone && (
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 bg-white border-2 border-slate-900 text-slate-900 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-black text-slate-400 tracking-wider font-oswald">Teléfono Secretaría</span>
                    <span className="text-sm font-black text-slate-900">{club.settings.contactPhone}</span>
                  </div>
                </div>
              )}
              {club.settings?.addressText && (
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 bg-white border-2 border-slate-900 text-slate-900 flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-black text-slate-400 tracking-wider font-oswald">Ubicación Sede Central</span>
                    <span className="text-sm font-black text-slate-900 leading-snug">{club.settings.addressText}</span>
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
      <section className="py-16 px-6 bg-slate-50">
        <NewsletterForm clubId={club.id} primaryColor={primaryColor} />
      </section>

      {/* ---------------- SECCIÓN SPONSORS (Brutalista con Bordes Dobles) ---------------- */}
      {club.sponsors.length > 0 && (
        <section className="py-16 bg-white border-t-4 border-slate-900">
          <div className="max-w-7xl mx-auto px-6 space-y-10">
            <div className="text-center space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-oswald">
                Sponsors Oficiales
              </span>
              <h3 className="font-oswald font-black text-2xl text-slate-900 uppercase italic">
                Acompañan Nuestra Institución
              </h3>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-6">
              {club.sponsors.map((sponsor) => (
                <div 
                  key={sponsor.id} 
                  className="bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 flex items-center justify-center h-16 w-36 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
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
