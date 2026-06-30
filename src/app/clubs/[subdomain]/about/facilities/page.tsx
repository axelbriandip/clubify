import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft, MapPin } from "lucide-react";
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
      {/* Cabecera */}
      <header className="bg-slate-900 text-white py-14 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[var(--primary-club)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
        <div className="relative max-w-5xl mx-auto space-y-4 z-10">
          <Link
            href={`/about`}
            className="inline-flex items-center text-xs font-bold text-slate-350 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver a Institucional
          </Link>
          <h1 className="text-4xl md:text-5xl font-outfit font-black uppercase tracking-tight">
            Nuestras Sedes
          </h1>
          <p className="text-sm md:text-base text-slate-205 max-w-xl">
            Explora las instalaciones, microestadios, canchas y complejos deportivos oficiales del club.
          </p>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="p-2.5 rounded-2xl bg-[var(--primary-club)]/10 text-[var(--primary-club)] border border-[var(--primary-club)]/20">
              <MapPin className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-outfit font-black uppercase tracking-tight text-slate-900">
              Sedes e Infraestructura
            </h2>
          </div>

          {club.facilities.length === 0 ? (
            <p className="text-xs text-slate-550 italic">No hay instalaciones registradas en el portal del club.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {club.facilities.map((fac) => (
                <div 
                  key={fac.id}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-[var(--primary-club)]/20 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {fac.imageUrl && (
                      <div className="h-44 bg-cover bg-center overflow-hidden relative">
                        <img 
                          src={fac.imageUrl} 
                          alt={fac.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6 space-y-2">
                      <h3 className="font-outfit font-black text-lg text-slate-900">{fac.name}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-4">{fac.description}</p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 mt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
                    <MapPin className="h-4.5 w-4.5 text-[var(--primary-club)] shrink-0" />
                    <span className="font-bold leading-normal truncate text-slate-500">{fac.address}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
