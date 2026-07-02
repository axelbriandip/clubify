import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft, User, Trophy } from "lucide-react";
import Link from "next/link";

interface CategoryPageProps {
  params: Promise<{ subdomain: string; categoryId: string }>;
}

async function getCategoryData(categoryId: string, subdomain: string) {
  const club = await db.club.findUnique({
    where: { slug: subdomain.toLowerCase().trim() },
    include: { settings: true },
  });

  if (!club) return null;

  const category = await db.category.findUnique({
    where: { id: categoryId },
    include: {
      discipline: true,
      staff: {
        include: {
          staffMember: {
            include: { person: true },
          },
        },
      },
      players: {
        include: {
          player: {
            include: { person: true },
          },
          positionRelation: true, // Cargar la relación a la tabla de posiciones dinámicas
        },
      },
    },
  });

  return { club, category };
}

// Agrupar jugadores usando estrictamente las posiciones relacionales definidas en la BD
function groupPlayersByPosition(players: any[]) {
  const groups: { [key: string]: any[] } = {};

  players.forEach((p) => {
    const posRel = p.positionRelation;

    // Fallback si no se asignó posición o relación
    if (!posRel) {
      if (!groups["Plantel General"]) groups["Plantel General"] = [];
      groups["Plantel General"].push(p);
      return;
    }

    const groupName = posRel.groupName;
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(p);
  });

  return groups;
}

export default async function ClubCategoryDetailPage({ params }: CategoryPageProps) {
  const { subdomain, categoryId } = await params;
  const data = await getCategoryData(categoryId, subdomain);

  if (!data || !data.category) {
    return notFound();
  }

  const { club, category } = data;
  const primaryColor = club.settings?.primaryColor || "#0284c7";
  const secondaryColor = club.settings?.secondaryColor || "#0f172a";

  const allPlayers = category.players || [];
  const groupedPlayers = groupPlayersByPosition(allPlayers);

  // Componente de Tarjeta
  const MemberCard = ({ member, isStaff = false }: { member: any; isStaff?: boolean }) => {
    const person = isStaff ? member.staffMember.person : member.player.person;
    const name = `${person.firstName} ${person.lastName}`;
    const photoUrl = isStaff 
      ? member.staffMember.photoSquareUrl 
      : member.player.photoSquareUrl;
    
    // Si es jugador, muestra "Grupo - Nombre Específico" o solo "Nombre Específico"
    const specificPosition = member.positionRelation?.name;
    const groupName = member.positionRelation?.groupName;
    
    let roleText = isStaff 
      ? (member.roleInCategory || member.staffMember.mainRole) 
      : (specificPosition || member.position || "Jugador");

    // Si tenemos grupo y posición específica que son distintos (ej: Defensores y Lateral Derecho), los mostramos juntos de forma elegante
    if (!isStaff && groupName && specificPosition && groupName.toUpperCase() !== specificPosition.toUpperCase()) {
      // Formato: DEFENSOR - LATERAL DERECHO
      const cleanGroup = groupName.endsWith("s") ? groupName.slice(0, -1) : groupName; // Quitar plural
      roleText = `${cleanGroup} - ${specificPosition}`;
    }

    return (
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[var(--primary-club)]/20 transition-all duration-300 flex flex-col justify-between group">
        <div>
          {/* Foto o Avatar */}
          {photoUrl ? (
            <div className="h-56 overflow-hidden relative border-b border-slate-100">
              <img 
                src={photoUrl} 
                alt={name} 
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="h-56 bg-gradient-to-tr from-slate-50 to-slate-100/50 flex flex-col items-center justify-center border-b border-slate-100 relative group-hover:from-slate-100/40 transition-colors">
              <div className="h-16 w-16 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-400 shadow-inner">
                <User className="h-8 w-8" />
              </div>
            </div>
          )}

          {/* Detalles */}
          <div className="p-5 space-y-2">
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-outfit font-black text-base text-slate-900 uppercase tracking-tight leading-snug">
                {name}
              </h4>
              {!isStaff && member.jerseyNumber && (
                <span className="h-7 w-7 rounded-lg bg-[var(--primary-club)]/10 text-[var(--primary-club)] font-black text-xs flex items-center justify-center shrink-0">
                  {member.jerseyNumber}
                </span>
              )}
            </div>
            
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              {roleText}
            </p>

            {/* Datos Físicos */}
            {!isStaff && (
              <div className="pt-2.5 border-t border-slate-100/60 grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-bold uppercase">
                {member.player.heightCm && (
                  <div>Alt: <span className="text-slate-800 font-black">{member.player.heightCm} cm</span></div>
                )}
                {member.player.weightKg && (
                  <div>Peso: <span className="text-slate-800 font-black">{parseFloat(member.player.weightKg.toString())} kg</span></div>
                )}
                {member.player.preferredSide && (
                  <div className="col-span-2">Pie/Mano: <span className="text-[var(--primary-club)] font-black">{member.player.preferredSide === "LEFT" ? "Izquierdo" : member.player.preferredSide === "RIGHT" ? "Derecho" : "Ambidiestro"}</span></div>
                )}
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
      {/* Cabecera Estilo Club */}
      <header className="bg-slate-900 text-white py-14 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[var(--primary-club)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
        <div className="relative max-w-5xl mx-auto space-y-4 z-10">
          <Link
            href={`/sports`}
            className="inline-flex items-center text-xs font-bold text-slate-350 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver a Disciplinas
          </Link>
          <h1 className="text-4xl md:text-5xl font-outfit font-black uppercase tracking-tight">
            {category.name}
          </h1>
          <p className="text-xs md:text-sm font-black text-slate-205 uppercase tracking-widest flex items-center gap-1.5 font-outfit">
            <Trophy className="h-4 w-4 text-[var(--primary-club)]" /> {category.discipline.name}
          </p>
        </div>
      </header>

      {/* Cuerpo Principal */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        
        {/* ================= SECCIÓN: CUERPO TÉCNICO ================= */}
        {category.staff.length > 0 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                Cuerpo Técnico
              </h3>
              <span className="text-[10px] font-black text-teal-650 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                {category.staff.length} {category.staff.length === 1 ? "Líder" : "Líderes"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {category.staff.map((member) => (
                <MemberCard key={member.id} member={member} isStaff={true} />
              ))}
            </div>
          </div>
        )}

        {/* ================= SECCIÓN: GRUPOS CLASIFICADOS DE JUGADORES ================= */}
        {allPlayers.length === 0 && category.staff.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center text-slate-400 text-sm shadow-sm font-semibold">
            No se han registrado deportistas ni cuerpo técnico en este plantel.
          </div>
        ) : (
          Object.keys(groupedPlayers)
            .sort((a, b) => {
              if (a === "Plantel General") return 1; // "Plantel General" va al final
              if (b === "Plantel General") return -1;
              const minA = Math.min(...groupedPlayers[a].map((p) => p.positionRelation?.sortOrder ?? 999));
              const minB = Math.min(...groupedPlayers[b].map((p) => p.positionRelation?.sortOrder ?? 999));
              return minA - minB;
            })
            .map((groupTitle) => {
              const list = groupedPlayers[groupTitle];
              return (
                <div key={groupTitle} className="space-y-6">
                  <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                      {groupTitle}
                    </h3>
                    <span className="text-[10px] font-black text-[var(--primary-club)] bg-[var(--primary-club)]/5 px-2.5 py-0.5 rounded-full border border-[var(--primary-club)]/10">
                      {list.length} {list.length === 1 ? "Jugador" : "Jugadores"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {list.map((item) => (
                      <MemberCard key={item.id} member={item} />
                    ))}
                  </div>
                </div>
              );
            })
        )}

      </main>
    </div>
  );
}
