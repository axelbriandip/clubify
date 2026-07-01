import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft, User, Shield, Users, Trophy, ChevronRight, Award } from "lucide-react";
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
        },
      },
    },
  });

  return { club, category };
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

  // Clasificar jugadores
  const arqueros = allPlayers.filter((p: any) => {
    const pos = (p.position || "").toLowerCase();
    return pos.includes("arquer") || pos.includes("porter") || pos.includes("goalk");
  });

  const defensores = allPlayers.filter((p: any) => {
    const pos = (p.position || "").toLowerCase();
    return pos.includes("defen") || pos.includes("zagu") || pos.includes("later") || pos.includes("central");
  });

  const mediocampistas = allPlayers.filter((p: any) => {
    const pos = (p.position || "").toLowerCase();
    return pos.includes("medio") || pos.includes("volan") || pos.includes("centro") || pos.includes("mcd") || pos.includes("mco") || pos.includes("mc");
  });

  const delanteros = allPlayers.filter((p: any) => {
    const pos = (p.position || "").toLowerCase();
    return pos.includes("delan") || pos.includes("extre") || pos.includes("punta") || pos.includes("9") || pos.includes("atac");
  });

  // Los que no entraron en las anteriores
  const otrosJugadores = allPlayers.filter((p: any) => {
    const pos = (p.position || "").toLowerCase();
    const isClassified = 
      pos.includes("arquer") || pos.includes("porter") || pos.includes("goalk") ||
      pos.includes("defen") || pos.includes("zagu") || pos.includes("later") || pos.includes("central") ||
      pos.includes("medio") || pos.includes("volan") || pos.includes("centro") || pos.includes("mcd") || pos.includes("mco") || pos.includes("mc") ||
      pos.includes("delan") || pos.includes("extre") || pos.includes("punta") || pos.includes("9") || pos.includes("atac");
    return !isClassified;
  });

  // Tarjeta de Jugador Componente Interno
  const MemberCard = ({ member, isStaff = false }: { member: any; isStaff?: boolean }) => {
    const person = isStaff ? member.staffMember.person : member.player.person;
    const name = `${person.firstName} ${person.lastName}`;
    const photoUrl = isStaff 
      ? member.staffMember.photoSquareUrl 
      : member.player.photoSquareUrl;
    
    const roleText = isStaff 
      ? (member.roleInCategory || member.staffMember.mainRole) 
      : member.position;

    return (
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[var(--primary-club)]/20 transition-all duration-300 flex flex-col justify-between group">
        <div>
          {/* Foto o Placeholder */}
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
              {roleText || (isStaff ? "Cuerpo Técnico" : "Jugador")}
            </p>

            {/* Datos adicionales de Jugador */}
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

  const RosterSection = ({ title, list }: { title: string; list: any[] }) => {
    if (list.length === 0) return null;
    return (
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
            {title}
          </h3>
          <span className="text-[10px] font-black text-[var(--primary-club)] bg-[var(--primary-club)]/5 px-2.5 py-0.5 rounded-full border border-[var(--primary-club)]/10">
            {list.length} {list.length === 1 ? "Integrante" : "Integrantes"}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {list.map((item) => (
            <MemberCard key={item.id} member={item} />
          ))}
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
          <p className="text-xs md:text-sm font-black text-slate-200 uppercase tracking-widest flex items-center gap-1.5 font-outfit">
            <Trophy className="h-4 w-4 text-[var(--primary-club)]" /> {category.discipline.name}
          </p>
        </div>
      </header>

      {/* Cuerpo Principal */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        
        {/* ================= CUERPO TÉCNICO ================= */}
        {category.staff.length > 0 && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                Cuerpo Técnico
              </h3>
              <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
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

        {/* ================= CLASIFICACIÓN DE JUGADORES ================= */}
        {allPlayers.length === 0 && category.staff.length === 0 ? (
          <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center text-slate-400 text-sm shadow-sm font-semibold">
            No se han registrado deportistas ni cuerpo técnico en este plantel.
          </div>
        ) : (
          <>
            <RosterSection title="Arqueros" list={arqueros} />
            <RosterSection title="Defensores" list={defensores} />
            <RosterSection title="Mediocampistas" list={mediocampistas} />
            <RosterSection title="Delanteros" list={delanteros} />
            <RosterSection title="Otras Posiciones" list={otrosJugadores} />
          </>
        )}

      </main>
    </div>
  );
}
