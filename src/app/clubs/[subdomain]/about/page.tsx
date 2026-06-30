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
      className="bg-slate-50 min-h-screen text-slate-805 pb-20 font-sans"
      style={{
        "--primary-club": primaryColor,
        "--secondary-club": secondaryColor,
      } as React.CSSProperties}
    >
      {/* Cabecera Estilo Club */}
      <header className="bg-slate-900 text-white py-14 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[var(--primary-club)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
        <div className="relative max-w-5xl mx-auto space-y-4">
          <Link
            href={`/`}
            className="inline-flex items-center text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver al Inicio
          </Link>
          <h1 className="text-4xl md:text-5xl font-outfit font-black uppercase tracking-tight">
            Institucional
          </h1>
          <p className="text-sm md:text-base text-slate-200 max-w-xl">
            Conoce la historia, comisiones directivas, valores y las sedes que hacen a la identidad de nuestro club.
          </p>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        
        {/* ================= SECCIÓN: NUESTRA HISTORIA ================= */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="p-2.5 rounded-2xl bg-[var(--primary-club)]/10 text-[var(--primary-club)] border border-[var(--primary-club)]/20">
                <Landmark className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-outfit font-black uppercase tracking-tight text-slate-900">
                Nuestra Historia & Valores
              </h2>
            </div>
            <p className="text-sm text-slate-605 leading-relaxed font-semibold">
              Fundado con la convicción de crear un espacio de pertenencia para las familias de nuestra ciudad, el club ha sido durante décadas un faro de desarrollo humano y deportivo. A través de la constancia, el juego limpio y el esfuerzo colectivo, formamos personas con valores sólidos y competidores apasionados en cada disciplina.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Hoy, con más de 10 disciplinas deportivas, un predio polideportivo en expansión y una masa societaria activa, seguimos construyendo un club moderno y dinámico para las futuras generaciones, sin perder la calidez de aquel primer grupo de socios fundadores.
            </p>
          </div>

          {/* Ficha Resumen */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-outfit font-black text-sm uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
              Ficha del Club
            </h3>
            <ul className="space-y-3 text-xs">
              <li className="flex justify-between">
                <span className="text-slate-400 font-bold">Nombre Oficial</span>
                <span className="font-black text-[var(--primary-club)]">{club.name}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400 font-bold">Lema Oficial</span>
                <span className="font-semibold text-slate-600 italic">"{club.settings?.heroSubtitle || "Fomentando el Deporte"}"</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400 font-bold">Fundación</span>
                <span className="font-bold text-slate-800">15 de Octubre de 1910</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400 font-bold">Colores</span>
                <span className="font-bold text-slate-800">Aurinegro</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400 font-bold">Apodo</span>
                <span className="font-bold text-slate-800">El Aurinegro</span>
              </li>
            </ul>
          </div>
        </section>

        {/* ================= SECCIÓN: COMISIÓN DIRECTIVA ================= */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="p-2.5 rounded-2xl bg-[var(--primary-club)]/10 text-[var(--primary-club)] border border-[var(--primary-club)]/20">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-outfit font-black uppercase tracking-tight text-slate-900">
              Comisión Directiva
            </h2>
          </div>

          {club.boardMembers.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No hay autoridades institucionales asignadas actualmente.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {club.boardMembers.map((member) => (
                <div 
                  key={member.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md hover:border-[var(--primary-club)]/20 transition-all duration-300"
                >
                  <div className="h-14 w-14 rounded-full bg-[var(--primary-club)]/10 text-[var(--primary-club)] flex items-center justify-center font-black text-xl border-2 border-[var(--primary-club)]/20 shrink-0">
                    {member.person.firstName.substring(0, 1)}{member.person.lastName.substring(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-outfit font-black text-slate-950 text-base leading-snug">
                      {member.person.firstName} {member.person.lastName}
                    </h3>
                    <span className="text-[10px] font-black uppercase text-[var(--primary-club)] bg-[var(--primary-club)]/5 px-2.5 py-0.5 rounded border border-[var(--primary-club)]/15 mt-1 inline-block">
                      {member.position}
                    </span>
                    {member.termStart && (
                      <span className="block text-[10px] text-slate-400 font-bold mt-1 inline-flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" /> Gestión 2024 - 2027
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
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="p-2.5 rounded-2xl bg-[var(--primary-club)]/10 text-[var(--primary-club)] border border-[var(--primary-club)]/20">
              <MapPin className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-outfit font-black uppercase tracking-tight text-slate-900">
              Nuestras Sedes & Instalaciones
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
        </section>

      </main>
    </div>
  );
}
