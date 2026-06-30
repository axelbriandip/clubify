import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Trophy, Shield, Award, ArrowLeft, Users, User } from "lucide-react";
import Link from "next/link";

interface SportsPageProps {
  params: Promise<{ subdomain: string }>;
}

async function getClubSports(slug: string) {
  const club = await db.club.findUnique({
    where: { slug: slug.toLowerCase().trim() },
    include: {
      settings: true,
      disciplines: {
        where: { isActive: true },
        include: {
          categories: {
            where: { isActive: true },
            include: {
              staff: {
                include: {
                  staffMember: {
                    include: {
                      person: true,
                    },
                  },
                },
              },
              players: {
                include: {
                  player: {
                    include: {
                      person: true,
                    },
                  },
                },
              },
            },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return club;
}

export default async function ClubSportsPage({ params }: SportsPageProps) {
  const { subdomain } = await params;
  const club = await getClubSports(subdomain);

  if (!club) {
    return notFound();
  }

  const primaryColor = club.settings?.primaryColor || "#0284c7";
  const secondaryColor = club.settings?.secondaryColor || "#0f172a";

  return (
    <div 
      className="bg-slate-50 min-h-screen text-slate-900 pb-20 font-sans"
      style={{
        "--primary-club": primaryColor,
        "--secondary-club": secondaryColor,
      } as React.CSSProperties}
    >
      {/* Cabecera Estilo Club */}
      <header className="bg-slate-900 text-white py-12 px-6 relative overflow-hidden border-b-4 border-slate-900">
        <div className="absolute inset-0 opacity-40 bg-[var(--primary-club)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
        <div className="relative max-w-5xl mx-auto space-y-4 z-10">
          <Link
            href={`/`}
            className="inline-flex items-center text-xs font-black uppercase font-oswald text-slate-350 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver al Inicio
          </Link>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic font-oswald drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            Disciplinas y Planteles
          </h1>
          <p className="text-xs md:text-sm text-slate-200 max-w-xl font-bold uppercase tracking-wider font-oswald">
            Conoce los deportes oficiales del club, sus categorías de competición y los planteles federados.
          </p>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {club.disciplines.length === 0 ? (
          <div className="bg-white border-2 border-slate-900 border-dashed p-8 rounded-none text-center text-slate-500 text-xs font-bold font-oswald uppercase tracking-wider">
            Aún no se han configurado disciplinas deportivas en el club.
          </div>
        ) : (
          club.disciplines.map((discipline) => (
            <div key={discipline.id} className="bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 space-y-6">
              
              {/* Info Deporte */}
              <div className="flex items-center gap-4 border-b-2 border-slate-900 pb-4">
                <div className="p-3 bg-white border-2 border-slate-900 text-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                  <Trophy className="h-6 w-6 text-[var(--primary-club)]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase font-oswald italic">
                    {discipline.name}
                  </h2>
                  {discipline.description && (
                    <p className="text-xs text-slate-500 mt-1 font-semibold">{discipline.description}</p>
                  )}
                </div>
              </div>

              {/* Categorías de este deporte */}
              {discipline.categories.length === 0 ? (
                <p className="text-xs text-slate-500 italic font-bold">No hay categorías cargadas.</p>
              ) : (
                <div className="space-y-8">
                  {discipline.categories.map((category) => (
                    <div key={category.id} className="space-y-4">
                      
                      {/* Título de la Categoría */}
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 font-oswald">
                        <span className="h-2 w-2 bg-[var(--primary-club)]"></span>
                        {category.name} 
                        {category.ageRange && (
                          <span className="text-xs text-slate-400 font-bold normal-case">
                            ({category.ageRange})
                          </span>
                        )}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        
                        {/* CUERPO TÉCNICO / STAFF */}
                        <div className="bg-slate-50 border-2 border-slate-900 shadow-inner p-4 space-y-3">
                          <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center font-oswald">
                            <Shield className="h-4 w-4 mr-1.5 text-teal-600" />
                            Cuerpo Técnico
                          </h4>
                          {category.staff.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Sin coordinadores asignados.</p>
                          ) : (
                            <ul className="space-y-2.5">
                              {category.staff.map((s) => (
                                <li key={s.id} className="flex items-center gap-2 text-xs">
                                  <div className="p-1 bg-white border border-slate-900 text-slate-900 shrink-0">
                                    <User className="h-3.5 w-3.5" />
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-800">
                                      {s.staffMember.person.lastName}, {s.staffMember.person.firstName}
                                    </span>
                                    <span className="block text-[10px] text-slate-500 font-bold uppercase font-oswald">
                                      {s.roleInCategory || s.staffMember.mainRole}
                                    </span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* PLANTEL JUGADORES */}
                        <div className="md:col-span-2 bg-slate-50 border-2 border-slate-900 shadow-inner p-4 space-y-3">
                          <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center font-oswald">
                            <Users className="h-4 w-4 mr-1.5 text-blue-600" />
                            Plantel Oficial
                          </h4>
                          {category.players.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No hay jugadores cargados en la lista.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {category.players.map((p) => (
                                <div 
                                  key={p.id} 
                                  className="p-2.5 bg-white border-2 border-slate-900 rounded-none flex items-center justify-between text-xs hover:border-[var(--primary-club)]/50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 border border-slate-900 bg-slate-900 text-white flex items-center justify-center font-black font-oswald text-[10px] shadow-sm">
                                      {p.jerseyNumber || "-"}
                                    </div>
                                    <div>
                                      <span className="font-bold text-slate-800">
                                        {p.player.person.lastName}, {p.player.person.firstName}
                                      </span>
                                      {p.position && (
                                        <span className="block text-[10px] text-slate-500 font-bold font-oswald uppercase">
                                          {p.position}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {p.player.preferredSide && (
                                    <span className="text-[9px] bg-slate-100 text-slate-700 border border-slate-900 font-bold px-1.5 py-0.5 font-oswald uppercase">
                                      {p.player.preferredSide === "LEFT" ? "Z" : p.player.preferredSide === "RIGHT" ? "D" : "A"}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}
