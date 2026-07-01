import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Trophy, ArrowLeft, Users, ChevronRight, UserCheck, Shield } from "lucide-react";
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
              _count: {
                select: {
                  players: true,
                  staff: true,
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
      className="bg-slate-50 min-h-screen text-slate-800 pb-20 font-sans"
      style={{
        "--primary-club": primaryColor,
        "--secondary-club": secondaryColor,
      } as React.CSSProperties}
    >
      {/* Cabecera Estilo Club */}
      <header className="bg-slate-900 text-white py-12 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[var(--primary-club)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
        <div className="relative max-w-5xl mx-auto space-y-4">
          <Link
            href={`/`}
            className="inline-flex items-center text-xs font-bold text-slate-355 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver al Inicio
          </Link>
          <h1 className="text-3xl md:text-5xl font-outfit font-black uppercase tracking-tight">
            Disciplinas Deportivas
          </h1>
          <p className="text-sm md:text-base text-slate-200 max-w-xl">
            Conoce los deportes oficiales de nuestra institución y navega por los planteles de cada categoría.
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
            <div key={discipline.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 space-y-6">
              
              {/* Info Deporte */}
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="p-3 rounded-2xl bg-[var(--primary-club)]/10 text-[var(--primary-club)] border border-[var(--primary-club)]/20">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-outfit font-black text-slate-900 uppercase">
                    {discipline.name}
                  </h2>
                  {discipline.description && (
                    <p className="text-xs text-slate-500 mt-1 font-medium">{discipline.description}</p>
                  )}
                </div>
              </div>

              {/* Categorías (Cards de Selección) */}
              {discipline.categories.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hay categorías cargadas para este deporte.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {discipline.categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/sports/categories/${category.id}`}
                      className="bg-slate-50/50 border border-slate-150 rounded-2xl p-5 hover:border-[var(--primary-club)]/30 hover:bg-white hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-4 group cursor-pointer"
                    >
                      <div className="space-y-2">
                        <h3 className="text-base font-outfit font-black text-slate-900 uppercase tracking-wide group-hover:text-[var(--primary-club)] transition-colors">
                          {category.name}
                        </h3>
                        {category.ageRange && (
                          <span className="text-[10px] bg-slate-200/60 text-slate-600 font-bold px-2 py-0.5 rounded uppercase">
                            Edad: {category.ageRange}
                          </span>
                        )}
                        
                        {/* Métricas rápidas */}
                        <div className="pt-2 flex gap-4 text-[10px] text-slate-500 font-bold uppercase">
                          <span className="flex items-center gap-1">
                            <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                            {category._count.players} Jugadores
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="h-3.5 w-3.5 text-slate-400" />
                            {category._count.staff} Staff
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-xs font-bold text-[var(--primary-club)] uppercase tracking-wider gap-0.5 mt-2">
                        Ver Plantel <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
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
