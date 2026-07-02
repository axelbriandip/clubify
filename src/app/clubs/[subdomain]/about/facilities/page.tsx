import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft, MapPin, Users, Award, Shield, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface FacilitiesPageProps {
  params: Promise<{ subdomain: string }>;
}

async function getClubFacilitiesData(slug: string) {
  return await db.club.findUnique({
    where: { slug: slug.toLowerCase().trim() },
    include: {
      settings: true,
      facilities: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

// Retorna detalles de especificaciones dinámicas basadas en el nombre del predio
function getFacilitySpecs(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes("carminatti") || normalized.includes("estadio")) {
    return {
      capacity: "15,000 espectadores",
      surface: "Césped Natural Pro",
      sports: ["Fútbol Profesional", "Prensa"],
      amenities: ["Cabinas de Transmisión", "Luz LED HD", "Estacionamiento", "Buffet", "Seguridad"],
    };
  }
  
  if (normalized.includes("centenario") || normalized.includes("gimnasio") || normalized.includes("microestadio")) {
    return {
      capacity: "1,500 espectadores",
      surface: "Parquet Flotante",
      sports: ["Básquetbol", "Vóleibol", "Patín Artístico"],
      amenities: ["Climatización", "Tablero Electrónico LED", "Vestuarios", "Acceso PMR", "Kiosco"],
    };
  }

  // Fallback / Complejo Las Tres Villas u otros
  return {
    capacity: "500 espectadores",
    surface: "Césped Sintético & Arena",
    sports: ["Hockey", "Fútbol Infantil", "Entrenamiento"],
    amenities: ["Gimnasio de Fuerza", "Dpto. Kinesiología", "Estacionamiento", "Duchas", "Iluminación Auxiliar"],
  };
}

export default async function ClubFacilitiesPage({ params }: FacilitiesPageProps) {
  const { subdomain } = await params;
  const club = await getClubFacilitiesData(subdomain);

  if (!club) {
    return notFound();
  }

  const primaryColor = club.settings?.primaryColor || "#0284c7";
  const secondaryColor = club.settings?.secondaryColor || "#0f172a";

  return (
    <div 
      className="bg-slate-50 min-h-screen text-slate-805 pb-20 font-sans"
      style={{
        "--primary-club": primaryColor,
        "--secondary-club": secondaryColor,
      } as React.CSSProperties}
    >
      {/* Cabecera Estilo Banner Premium */}
      <header className="bg-slate-900 text-white py-14 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[var(--primary-club)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
        <div className="relative max-w-5xl mx-auto space-y-4 z-10">
          <Link
            href={`/about`}
            className="inline-flex items-center text-xs font-bold text-slate-355 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver a Institucional
          </Link>
          <h1 className="text-4xl md:text-5xl font-outfit font-black uppercase tracking-tight">
            Nuestras Sedes
          </h1>
          <p className="text-sm md:text-base text-slate-205 max-w-xl">
            Explora las instalaciones, microestadios, canchas y complejos deportivos oficiales de {club.name}.
          </p>
        </div>
      </header>

      {/* Contenido Principal (Bento Grid) */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="p-2.5 rounded-2xl bg-[var(--primary-club)]/10 text-[var(--primary-club)] border border-[var(--primary-club)]/20">
            <MapPin className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-outfit font-black uppercase tracking-tight text-slate-900">
            Infraestructura y Predios
          </h2>
        </div>

        {club.facilities.length === 0 ? (
          <p className="text-xs text-slate-550 italic">No hay instalaciones registradas en el portal del club.</p>
        ) : (
          /* Bento Grid Asimétrico */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {club.facilities.map((fac, idx) => {
              const specs = getFacilitySpecs(fac.name);
              
              // El primer elemento toma 2 columnas en desktop, el tercero toma todo el ancho abajo (3 columnas)
              const bentoColSpan = idx === 0 
                ? "md:col-span-2" 
                : idx === 2 
                  ? "md:col-span-3" 
                  : "md:col-span-1";

              // Enlace de Google Maps dinámico
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fac.address + ", " + fac.name)}`;

              return (
                <div 
                  key={fac.id}
                  className={`bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[var(--primary-club)]/20 transition-all duration-300 flex flex-col justify-between group ${bentoColSpan}`}
                >
                  <div className="flex flex-col h-full justify-between">
                    
                    {/* Foto en Bento Grid (Grayscale -> Color en Hover) */}
                    {fac.imageUrl && (
                      <div className="h-56 bg-slate-950 overflow-hidden relative border-b border-slate-100">
                        <img 
                          src={fac.imageUrl} 
                          alt={fac.name} 
                          className="w-full h-full object-cover group-hover:scale-103 transition-all duration-500 ease-in-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-40 group-hover:opacity-10 transition-opacity duration-500"></div>
                      </div>
                    )}

                    {/* Información y especificaciones detalladas */}
                    <div className="p-6 space-y-5 flex-1">
                      
                      <div className="space-y-2">
                        {/* Categoría / Deportes principales */}
                        <div className="flex flex-wrap gap-1.5">
                          {specs.sports.map((sport, sIdx) => (
                            <span 
                              key={sIdx}
                              className="text-[8px] font-black uppercase tracking-wider text-[var(--primary-club)] bg-[var(--primary-club)]/5 px-2.5 py-0.5 rounded border border-[var(--primary-club)]/10"
                            >
                              {sport}
                            </span>
                          ))}
                        </div>
                        <h3 className="font-outfit font-black text-xl text-slate-900 uppercase tracking-tight leading-none pt-1">
                          {fac.name}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                          {fac.description}
                        </p>
                      </div>

                      {/* Características / Amenidades (Diseño de chips Pro) */}
                      <div className="space-y-2.5 pt-4 border-t border-slate-100/60">
                        <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          Especificaciones Técnicas
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-2.5 text-[10px] text-slate-600 font-bold uppercase">
                          <div>Superficie: <span className="text-slate-905 font-black block normal-case">{specs.surface}</span></div>
                          <div>Aforo: <span className="text-[var(--primary-club)] font-black block">{specs.capacity}</span></div>
                        </div>

                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {specs.amenities.map((am, amIdx) => (
                            <span 
                              key={amIdx}
                              className="text-[9px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 rounded-full px-3 py-1 flex items-center gap-1"
                            >
                              <span className="h-1 w-1 rounded-full bg-slate-400"></span>
                              {am}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Dirección Física + Botón Google Maps */}
                    <div className="p-6 pt-0 mt-4 border-t border-slate-100/60 flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-2 text-slate-500 font-bold truncate">
                        <MapPin className="h-4.5 w-4.5 text-[var(--primary-club)] shrink-0" />
                        <span className="truncate leading-none">{fac.address}</span>
                      </div>
                      
                      <a 
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9px] font-black uppercase text-[var(--primary-club)] bg-[var(--primary-club)]/5 border border-[var(--primary-club)]/15 px-3 py-1.5 rounded-full hover:bg-[var(--primary-club)] hover:text-white hover:border-transparent transition-all shrink-0 hover:scale-102"
                      >
                        Cómo llegar
                      </a>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
