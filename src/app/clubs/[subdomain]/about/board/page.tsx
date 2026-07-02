import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft, Users, Calendar, User, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface BoardPageProps {
  params: Promise<{ subdomain: string }>;
}

async function getClubBoardData(slug: string) {
  return await db.club.findUnique({
    where: { slug: slug.toLowerCase().trim() },
    include: {
      settings: true,
      boardMembers: {
        where: { isActive: true },
        include: { person: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

// Clasificar autoridades por jerarquía administrativa
function categorizeBoard(members: any[]) {
  const president = members.find(
    (m) => m.position.toLowerCase().includes("presidente") && !m.position.toLowerCase().includes("vice")
  );
  
  const executives = members.filter((m) => {
    const pos = m.position.toLowerCase();
    const isPres = pos.includes("presidente") && !pos.includes("vice");
    const isExec = pos.includes("vice") || pos.includes("secretario") || pos.includes("tesorero");
    return !isPres && isExec;
  });

  const others = members.filter((m) => {
    const pos = m.position.toLowerCase();
    const isPres = pos.includes("presidente") && !pos.includes("vice");
    const isExec = pos.includes("vice") || pos.includes("secretario") || pos.includes("tesorero");
    return !isPres && !isExec;
  });

  return { president, executives, others };
}

export default async function ClubBoardPage({ params }: BoardPageProps) {
  const { subdomain } = await params;
  const club = await getClubBoardData(subdomain);

  if (!club) {
    return notFound();
  }

  const primaryColor = club.settings?.primaryColor || "#0284c7";
  const secondaryColor = club.settings?.secondaryColor || "#0f172a";

  const { president, executives, others } = categorizeBoard(club.boardMembers);

  // Componente de Tarjeta Reutilizable con Efecto Grayscale-to-Color
  const AuthorityCard = ({ member, size = "normal" }: { member: any; size?: "large" | "normal" | "small" }) => {
    const name = `${member.person.firstName} ${member.person.lastName}`;
    const photoUrl = member.photoSquareUrl;

    const isLarge = size === "large";
    const isSmall = size === "small";

    return (
      <div 
        className={`bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[var(--primary-club)]/20 transition-all duration-300 flex flex-col justify-between group ${
          isLarge ? "md:flex-row md:col-span-3 border-2 border-[var(--primary-club)]/30" : ""
        }`}
      >
        <div className={`flex flex-col ${isLarge ? "md:flex-row w-full" : "w-full"}`}>
          {/* Contenedor de Imagen (Grayscale -> Color en Hover) */}
          {photoUrl ? (
            <div className={`overflow-hidden relative bg-slate-950 shrink-0 ${
              isLarge 
                ? "h-72 w-full md:w-72 md:border-r" 
                : isSmall 
                  ? "h-48 w-full border-b" 
                  : "h-56 w-full border-b"
            }`}>
              <img 
                src={photoUrl} 
                alt={name} 
                className="w-full h-full object-cover group-hover:scale-103 transition-all duration-500 ease-in-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-40 group-hover:opacity-10 transition-opacity duration-505"></div>
            </div>
          ) : (
            <div className={`bg-gradient-to-tr from-slate-50 to-slate-100/50 flex flex-col items-center justify-center border-slate-100 shrink-0 relative group-hover:from-slate-100/40 transition-colors ${
              isLarge 
                ? "h-72 w-full md:w-72 md:border-r" 
                : isSmall 
                  ? "h-48 w-full border-b" 
                  : "h-56 w-full border-b"
            }`}>
              <div className="h-16 w-16 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-400 shadow-inner">
                <User className="h-8 w-8" />
              </div>
            </div>
          )}

          {/* Detalles del Directivo */}
          <div className={`p-6 flex flex-col justify-between ${isLarge ? "flex-1" : ""}`}>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--primary-club)]">
                  {member.position}
                </span>
                {isLarge && (
                  <span className="h-4 w-4 text-emerald-500" title="Presidente electo">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                )}
              </div>
              <h3 className={`font-outfit font-black text-slate-900 uppercase tracking-tight leading-none ${
                isLarge ? "text-2xl md:text-3xl" : "text-base"
              }`}>
                {name}
              </h3>
              {isLarge ? (
                <p className="text-xs text-slate-500 font-semibold leading-relaxed pt-2">
                  Responsable de coordinar el rumbo estratégico del club, presidir las asambleas societarias y guiar los proyectos de expansión polideportiva y modernización de la institución.
                </p>
              ) : null}
            </div>

            {member.termStart && (
              <div className="pt-4 border-t border-slate-100/60 flex items-center text-[10px] text-slate-400 font-bold uppercase gap-1 mt-4">
                <Calendar className="h-3.5 w-3.5 text-[var(--primary-club)]" />
                <span>Gestión 2024 - 2027</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

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
            Comisión Directiva
          </h1>
          <p className="text-sm md:text-base text-slate-205 max-w-xl">
            Conoce a los integrantes de la mesa directiva y las autoridades administrativas de {club.name}.
          </p>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        
        {club.boardMembers.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center text-slate-400 text-sm shadow-sm font-semibold">
            No hay autoridades institucionales asignadas actualmente.
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* 1. MESA PRESIDENCIAL (Rango Alto) */}
            {president && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Presidencia del Club
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3">
                  <AuthorityCard member={president} size="large" />
                </div>
              </div>
            )}

            {/* 2. MESA EJECUTIVA (Secretario, Tesorero, Vicepresidente) */}
            {executives.length > 0 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Mesa Ejecutiva
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {executives.map((member) => (
                    <AuthorityCard key={member.id} member={member} size="normal" />
                  ))}
                </div>
              </div>
            )}

            {/* 3. VOCALES Y AUTORIDADES DE GESTIÓN (Otros miembros) */}
            {others.length > 0 && (
              <div className="space-y-6">
                <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                    Vocales y Comisión de Apoyo
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {others.map((member) => (
                    <AuthorityCard key={member.id} member={member} size="small" />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
