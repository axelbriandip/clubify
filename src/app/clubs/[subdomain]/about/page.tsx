import React from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft, Landmark, Users, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";

interface AboutPageProps {
  params: Promise<{ subdomain: string }>;
}

async function getClubData(slug: string) {
  return await db.club.findUnique({
    where: { slug: slug.toLowerCase().trim() },
    include: { settings: true },
  });
}

export default async function ClubAboutIndexPage({ params }: AboutPageProps) {
  const { subdomain } = await params;
  const club = await getClubData(subdomain);

  if (!club) {
    return notFound();
  }

  const primaryColor = club.settings?.primaryColor || "#0284c7";
  const secondaryColor = club.settings?.secondaryColor || "#0f172a";

  const subSections = [
    {
      title: "Nuestra Historia",
      description: "Conocé nuestros orígenes, hitos históricos, colores oficiales y los valores deportivos que nos guían desde la fundación.",
      icon: Landmark,
      href: "/about/history",
      colorClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
    {
      title: "Comisión Directiva",
      description: "Conocé a los integrantes de la mesa dirigencial, autoridades oficiales y la gestión administrativa de la institución.",
      icon: Users,
      href: "/about/board",
      colorClass: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
    {
      title: "Sedes e Instalaciones",
      description: "Explorá nuestros predios de entrenamiento, sedes sociales, estadios y gimnasios polideportivos habilitados.",
      icon: MapPin,
      href: "/about/facilities",
      colorClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
  ];

  return (
    <div 
      className="bg-slate-50 min-h-screen text-slate-805 pb-20 font-sans"
      style={{
        "--primary-club": primaryColor,
        "--secondary-club": secondaryColor,
      } as React.CSSProperties}
    >
      {/* Cabecera Principal */}
      <header className="bg-slate-900 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[var(--primary-club)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
        <div className="relative max-w-5xl mx-auto space-y-4 z-10">
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
            Explora las secciones oficiales del club para conocer más sobre nuestra historia, autoridades y sedes deportivas.
          </p>
        </div>
      </header>

      {/* Selector de Subsecciones (Cards Premium) */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {subSections.map((sec) => {
            const IconComponent = sec.icon;
            return (
              <Link 
                href={sec.href}
                key={sec.title}
                className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-between gap-8 shadow-sm hover:shadow-xl hover:border-[var(--primary-club)]/20 transition-all duration-300 group cursor-pointer"
              >
                <div className="space-y-4">
                  <div className={`p-3.5 rounded-2xl border w-fit ${sec.colorClass}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h3 className="font-outfit font-black text-xl text-slate-900 group-hover:text-[var(--primary-club)] transition-colors uppercase">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {sec.description}
                  </p>
                </div>

                <div className="flex items-center text-xs font-bold text-[var(--primary-club)] tracking-wider uppercase gap-1 mt-2">
                  Explorar Sección <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
