import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft, Landmark } from "lucide-react";
import Link from "next/link";

interface HistoryPageProps {
  params: Promise<{ subdomain: string }>;
}

async function getClubData(slug: string) {
  return await db.club.findUnique({
    where: { slug: slug.toLowerCase().trim() },
    include: { settings: true },
  });
}

export default async function ClubHistoryPage({ params }: HistoryPageProps) {
  const { subdomain } = await params;
  const club = await getClubData(subdomain);

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
            Nuestra Historia
          </h1>
          <p className="text-sm md:text-base text-slate-205 max-w-xl">
            Fundación, trayectoria, colores y los valores de la institución.
          </p>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="p-2.5 rounded-2xl bg-[var(--primary-club)]/10 text-[var(--primary-club)] border border-[var(--primary-club)]/20">
                <Landmark className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-outfit font-black uppercase tracking-tight text-slate-900">
                Trayectoria y Valores
              </h2>
            </div>
            <p className="text-sm text-slate-605 leading-relaxed font-semibold">
              Fundado con la convicción de crear un espacio de pertenencia para las familias de nuestra ciudad, el club ha sido durante décadas un faro de desarrollo humano y deportivo. A través de la constancia, el juego limpio y el esfuerzo colectivo, formamos personas con valores sólidos y competidores apasionados en cada disciplina.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Hoy, con más de 10 disciplinas deportivas, un predio polideportivo en expansión y una masa societaria activa, seguimos construyendo un club moderno y dinámico para las futuras generaciones, sin perder la calidez de aquel primer grupo de socios fundadores.
            </p>
          </div>

          {/* Ficha Resumen */}
          <div className="bg-white border border-slate-205 rounded-3xl p-6 shadow-sm space-y-4">
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
                <span className="font-bold text-slate-850">15 de Octubre de 1910</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400 font-bold">Colores</span>
                <span className="font-bold text-slate-850">Aurinegro</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-400 font-bold">Apodo</span>
                <span className="font-bold text-slate-850">El Aurinegro</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
