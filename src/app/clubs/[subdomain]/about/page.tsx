import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft, Landmark, Users, MapPin, Award, Calendar } from "lucide-react";
import Link from "next/link";

interface AboutPageProps {
  params: Promise<{ subdomain: string }>;
}

async function getClubAboutData(slug: string) {
  const club = await db.club.findUnique({
    where: { slug: slug.toLowerCase().trim() },
    include: {
      settings: true,
      boardMembers: {
        where: { isActive: true },
        include: {
          person: true,
        },
        orderBy: { sortOrder: "asc" },
      },
      facilities: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return club;
}

export default async function ClubAboutPage({ params }: AboutPageProps) {
  const { subdomain } = await params;
  const club = await getClubAboutData(subdomain);

  if (!club) {
    return notFound();
  }

  const primaryColor = club.settings?.primaryColor || "#0284c7";
  const secondaryColor = club.settings?.secondaryColor || "#0f172a";

  return (
    <div 
      className="bg-slate-950 min-h-screen text-slate-100 pb-20 font-outfit"
      style={{
        "--primary-club": primaryColor,
        "--secondary-club": secondaryColor,
      } as React.CSSProperties}
    >
      {/* Cabecera Estilo Club */}
      <header className="bg-slate-900 text-white py-14 px-6 relative overflow-hidden border-b border-slate-850">
        <div className="absolute inset-0 opacity-15 bg-gradient-to-r from-blue-900 to-slate-950"></div>
        <div className="relative max-w-5xl mx-auto space-y-4">
          <Link
            href={`/`}
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver al Inicio
          </Link>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight italic">
            Institucional
          </h1>
          <p className="text-sm md:text-base text-slate-350 max-w-xl">
            Conoce la historia, comisiones directivas, valores y las sedes que hacen a la identidad de nuestro club.
          </p>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto px-6 py-16 space-y-20">
        
        {/* ================= SECCIÓN: NUESTRA HISTORIA ================= */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-850 pb-4">
              <div className="p-2.5 rounded-2xl bg-[var(--primary-club)]/10 text-[var(--primary-club)] border border-[var(--primary-club)]/20">
                <Landmark className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white italic">
                Nuestra Historia & Valores
              </h2>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Fundado con la convicción de crear un espacio de pertenencia para las familias de nuestra ciudad, el club ha sido durante décadas un faro de desarrollo humano y deportivo. A través de la constancia, el juego limpio y el esfuerzo colectivo, formamos personas con valores sólidos y competidores apasionados en cada disciplina.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hoy, con más de 10 disciplinas deportivas, un predio polideportivo en expansión y una masa societaria activa, seguimos construyendo un club moderno y dinámico para las futuras generaciones, sin perder la calidez de aquel primer grupo de socios fundadores.
            </p>
          </div>

          {/* Ficha Resumen */}
          <div className="bg-slate-900/60 border border-slate-850 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-black text-sm uppercase tracking-wider text-white border-b border-slate-850 pb-2">
              Ficha del Club
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex justify-between">
                <span className="text-slate-500 font-bold">Nombre Oficial</span>
                <span className="font-black text-[var(--primary-club)]">{club.name}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-500 font-bold">Lema Oficial</span>
                <span className="font-semibold text-slate-300 italic">"{club.settings?.heroSubtitle || "Fomentando el Deporte"}"</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-500 font-bold">Fundación</span>
                <span className="font-extrabold text-slate-205">15 de Octubre de 1910</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-500 font-bold">Colores</span>
                <span className="font-extrabold text-slate-205">Aurinegro</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-500 font-bold">Apodo</span>
                <span className="font-extrabold text-slate-205">El Aurinegro</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ================= SECCIÓN: COMISIÓN DIRECTIVA ================= */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-850 pb-4">
            <div className="p-2.5 rounded-2xl bg-[var(--primary-club)]/10 text-[var(--primary-club)] border border-[var(--primary-club)]/20">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white italic">
              Comisión Directiva
            </h2>
          </div>

          {club.boardMembers.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No hay autoridades institucionales asignadas actualmente.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {club.boardMembers.map((member) => (
                <div 
                  key={member.id}
                  className="bg-slate-900/60 border border-slate-850 rounded-3xl p-6 shadow-xl flex items-center gap-4 hover:shadow-2xl hover:border-[var(--primary-club)]/40 transition-all duration-300"
                >
                  <div className="h-14 w-14 rounded-full bg-slate-950 flex items-center justify-center text-white font-black text-xl border-2 border-[var(--primary-club)] shrink-0 shadow-inner">
                    {member.person.firstName.substring(0, 1)}{member.person.lastName.substring(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base leading-snug">
                      {member.person.firstName} {member.person.lastName}
                    </h3>
                    <span className="text-xs font-black uppercase text-[var(--primary-club)] bg-[var(--primary-club)]/5 px-2.5 py-0.5 rounded border border-[var(--primary-club)]/10 mt-1.5 inline-block">
                      {member.position}
                    </span>
                    {member.termStart && (
                      <span className="block text-[10px] text-slate-400 font-bold mt-1.5 flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-[var(--primary-club)]" /> Gestión 2024 - 2027
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ================= SECCIÓN: INSTALACIONES / SEDES ================= */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-850 pb-4">
            <div className="p-2.5 rounded-2xl bg-[var(--primary-club)]/10 text-[var(--primary-club)] border border-[var(--primary-club)]/20">
              <MapPin className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white italic">
              Nuestras Sedes & Instalaciones
            </h2>
          </div>

          {club.facilities.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No hay instalaciones registradas en el portal del club.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {club.facilities.map((fac) => (
                <div 
                  key={fac.id}
                  className="bg-slate-900/60 border border-slate-850 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-[var(--primary-club)]/40 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {fac.imageUrl && (
                      <div className="h-44 bg-cover bg-center overflow-hidden relative">
                        <img 
                          src={fac.imageUrl} 
                          alt={fac.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
                      </div>
                    )}
                    <div className="p-6 space-y-2">
                      <h3 className="font-black text-lg text-white">{fac.name}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">{fac.description}</p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 mt-4 border-t border-slate-850 flex items-center gap-2 text-xs text-slate-400">
                    <MapPin className="h-4.5 w-4.5 text-[var(--primary-club)] shrink-0" />
                    <span className="font-bold leading-normal truncate text-slate-350">{fac.address}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
