import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft, Users, Calendar } from "lucide-react";
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

export default async function ClubBoardPage({ params }: BoardPageProps) {
  const { subdomain } = await params;
  const club = await getClubBoardData(subdomain);

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
            Comisión Directiva
          </h1>
          <p className="text-sm md:text-base text-slate-205 max-w-xl">
            Conoce a los integrantes de la mesa directiva y las autoridades administrativas.
          </p>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="p-2.5 rounded-2xl bg-[var(--primary-club)]/10 text-[var(--primary-club)] border border-[var(--primary-club)]/20">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-outfit font-black uppercase tracking-tight text-slate-900">
              Autoridades de la Gestión
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
        </div>
      </main>
    </div>
  );
}
