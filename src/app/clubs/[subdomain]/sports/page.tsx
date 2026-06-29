import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Dribbble, Shield, Award, ArrowLeft, Users, User } from "lucide-react";
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
      className="bg-slate-50 min-h-screen text-slate-800 pb-20"
      style={{
        "--primary-club": primaryColor,
        "--secondary-club": secondaryColor,
      } as React.CSSProperties}
    >
      {/* Cabecera Estilo Club */}
      <header className="bg-slate-900 text-white py-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-blue-900 to-slate-950"></div>
        <div className="relative max-w-5xl mx-auto space-y-4">
          <Link
            href={`/`}
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver al Inicio
          </Link>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
            Disciplinas y Planteles
          </h1>
          <p className="text-sm md:text-base text-slate-300 max-w-xl">
            Conoce los deportes oficiales del club, sus categorías de competición y los planteles federados.
          </p>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {club.disciplines.length === 0 ? (
          <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-400 text-sm shadow-sm">
            Aún no se han configurado disciplinas deportivas en el club.
          </div>
        ) : (
          club.disciplines.map((discipline) => (
            <div key={discipline.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
              {/* Info Deporte */}
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2.5 rounded-xl bg-[var(--primary-club)]/10 text-[var(--primary-club)]">
                  <Dribbble className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase">
                    {discipline.name}
                  </h2>
                  {discipline.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{discipline.description}</p>
                  )}
                </div>
              </div>

              {/* Categorías de este deporte */}
              {discipline.categories.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hay categorías cargadas.</p>
              ) : (
                <div className="space-y-8">
                  {discipline.categories.map((category) => (
                    <div key={category.id} className="space-y-4">
                      {/* Título de la Categoría */}
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[var(--primary-club)]"></span>
                        {category.name} 
                        {category.ageRange && (
                          <span className="text-xs text-slate-500 font-normal normal-case">
                            ({category.ageRange})
                          </span>
                        )}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* CUERPO TÉCNICO / STAFF */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                          <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center">
                            <Shield className="h-4 w-4 mr-1.5 text-teal-600" />
                            Cuerpo Técnico
                          </h4>
                          {category.staff.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Sin coordinadores asignados.</p>
                          ) : (
                            <ul className="space-y-2">
                              {category.staff.map((s) => (
                                <li key={s.id} className="flex items-center gap-2 text-xs">
                                  <div className="p-1 bg-teal-100 text-teal-800 rounded">
                                    <User className="h-3 w-3" />
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-800">
                                      {s.staffMember.person.lastName}, {s.staffMember.person.firstName}
                                    </span>
                                    <span className="block text-[10px] text-slate-500 font-medium">
                                      {s.roleInCategory || s.staffMember.mainRole}
                                    </span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* PLANTEL JUGADORES */}
                        <div className="md:col-span-2 bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                          <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center">
                            <Users className="h-4 w-4 mr-1.5 text-blue-600" />
                            Plantel Oficial
                          </h4>
                          {category.players.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No hay jugadores cargados en la lista.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {category.players.map((p) => (
                                <div 
                                  key={p.id} 
                                  className="p-2.5 bg-white border border-slate-100 rounded-lg flex items-center justify-between text-xs shadow-sm"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                      {p.jerseyNumber || "-"}
                                    </div>
                                    <div>
                                      <span className="font-bold text-slate-800">
                                        {p.player.person.lastName}, {p.player.person.firstName}
                                      </span>
                                      {p.position && (
                                        <span className="block text-[10px] text-slate-500">
                                          {p.position}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {p.player.preferredSide && (
                                    <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
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
