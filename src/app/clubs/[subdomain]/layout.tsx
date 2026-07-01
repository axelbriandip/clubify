import React from "react";
import Link from "next/link";
import { Outfit, Inter } from "next/font/google";
import { Mail, Phone, MapPin, Heart, ChevronRight, Award, ChevronDown } from "lucide-react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AdminFloatingButton from "@/components/AdminFloatingButton";

// Cargamos tipografías de Google Fonts de forma premium
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

interface ClubLayoutProps {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}

async function getClubConfig(slug: string) {
  return await db.club.findUnique({
    where: { slug: slug.toLowerCase().trim() },
    include: {
      settings: true,
      disciplines: {
        where: { isActive: true },
        include: {
          categories: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export default async function ClubLayout({ children, params }: ClubLayoutProps) {
  const { subdomain } = await params;
  const club = await getClubConfig(subdomain);

  if (!club) {
    return notFound();
  }

  const primaryColor = club.settings?.primaryColor || "#0284c7";
  const secondaryColor = club.settings?.secondaryColor || "#0f172a";

  return (
    <div
      className={`${outfit.variable} ${inter.variable} min-h-screen bg-white text-slate-800 flex flex-col font-sans antialiased`}
      style={{
        "--primary-club": primaryColor,
        "--secondary-club": secondaryColor,
      } as React.CSSProperties}
    >
      {/* ---------------- BARRA DE NAVEGACIÓN STICKY & GLASSMORPHISM ---------------- */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          
          {/* Logo / Nombre del Club */}
          <Link 
            href={`/`}
            className="flex items-center gap-3 group"
          >
            <div 
              style={{ backgroundColor: primaryColor }}
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-black shadow-md shadow-[var(--primary-club)]/20 group-hover:scale-105 transition-transform"
            >
              {club.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="font-outfit font-black text-lg text-slate-900 tracking-tight block uppercase leading-none">
                {club.name}
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">
                Portal Oficial
              </span>
            </div>
          </Link>
 
          {/* Menú de Navegación del Visitante */}
          <nav className="hidden md:!flex items-center gap-8">
            <Link 
              href={`/`}
              className="font-semibold text-sm text-slate-650 hover:text-[var(--primary-club)] transition-colors"
            >
              Inicio
            </Link>
            {/* Dropdown Institucional */}
            <div className="relative group py-2">
              <button className="flex items-center gap-1 font-semibold text-sm text-slate-655 hover:text-[var(--primary-club)] transition-colors cursor-pointer">
                Institucional
                <ChevronDown className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <div className="absolute left-0 mt-2.5 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2.5">
                <Link 
                  href={`/about`}
                  className="block px-4 py-2 text-xs font-extrabold uppercase text-slate-700 hover:bg-slate-50 hover:text-[var(--primary-club)] transition-colors"
                >
                  General / Índice
                </Link>
                <div className="border-t border-slate-100/60 my-1"></div>
                <Link 
                  href={`/about/history`}
                  className="block px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[var(--primary-club)] transition-colors"
                >
                  Nuestra Historia
                </Link>
                <Link 
                  href={`/about/board`}
                  className="block px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[var(--primary-club)] transition-colors"
                >
                  Comisión Directiva
                </Link>
                <Link 
                  href={`/about/facilities`}
                  className="block px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-[var(--primary-club)] transition-colors"
                >
                  Sedes e Instalaciones
                </Link>
              </div>
            </div>
            {/* Dropdown Disciplinas */}
            <div className="relative group py-2">
              <button className="flex items-center gap-1 font-semibold text-sm text-slate-655 hover:text-[var(--primary-club)] transition-colors cursor-pointer">
                Disciplinas
                <ChevronDown className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <div className="absolute left-0 mt-2.5 w-60 bg-white border border-slate-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2.5 max-h-[70vh] overflow-y-auto">
                <Link 
                  href={`/sports`}
                  className="block px-4 py-2 text-xs font-extrabold uppercase text-slate-700 hover:bg-slate-50 hover:text-[var(--primary-club)] transition-colors"
                >
                  Ver Todas las Disciplinas
                </Link>
                {club.disciplines.length > 0 && <div className="border-t border-slate-100/60 my-1"></div>}
                
                {club.disciplines.map((disc: any) => (
                  <div key={disc.id} className="px-4 py-1.5">
                    <Link
                      href={`/sports#discipline-${disc.id}`}
                      className="block text-[10px] font-black uppercase text-slate-400 hover:text-[var(--primary-club)] tracking-wider"
                    >
                      {disc.name}
                    </Link>
                    <div className="pl-2 mt-1 space-y-1 border-l border-slate-100">
                      {disc.categories.map((cat: any) => (
                        <Link 
                          key={cat.id}
                          href={`/sports/categories/${cat.id}`}
                          className="block text-xs font-semibold text-slate-600 hover:text-[var(--primary-club)] transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Link 
              href={`/news`}
              className="font-semibold text-sm text-slate-655 hover:text-[var(--primary-club)] transition-colors"
            >
              Prensa
            </Link>
          </nav>
 
          {/* Botón de Membresía (CTA) */}
          <div className="flex items-center gap-4">
            <Link
              href={`/apply`}
              style={{ backgroundColor: primaryColor }}
              className="hidden sm:!inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-white hover:brightness-110 shadow-lg shadow-[var(--primary-club)]/10 hover:shadow-[var(--primary-club)]/20 hover:scale-103 transition-all"
            >
              Hacete Socio
            </Link>
          </div>
        </div>
      </header>

      {/* ---------------- CONTENIDO DINÁMICO ---------------- */}
      <main className="flex-grow">
        {children}
      </main>

      {/* ---------------- PIE DE PÁGINA PREMIUM ---------------- */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-slate-900 pb-12 mb-12">
          
          {/* Columna 1: Presentación */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div 
                style={{ backgroundColor: primaryColor }}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
              >
                {club.name.substring(0, 2).toUpperCase()}
              </div>
              <h4 className="text-white font-black uppercase tracking-wider text-base">
                {club.name}
              </h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Sitio web oficial de la institución deportiva autogenerado por la plataforma Clubify. 
              Fomentando el deporte, los valores y el sentido de pertenencia en nuestra comunidad.
            </p>
          </div>

          {/* Columna 2: Contacto */}
          <div className="space-y-4">
            <h5 className="text-white font-bold uppercase text-xs tracking-widest">
              Contacto
            </h5>
            <ul className="space-y-3 text-xs">
              {club.settings?.contactEmail && (
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-[var(--primary-club)] shrink-0" />
                  <span className="truncate">{club.settings.contactEmail}</span>
                </li>
              )}
              {club.settings?.contactPhone && (
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-[var(--primary-club)] shrink-0" />
                  <span>{club.settings.contactPhone}</span>
                </li>
              )}
              {club.settings?.addressText && (
                <li className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-[var(--primary-club)] shrink-0" />
                  <span className="leading-snug">{club.settings.addressText}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Columna 3: Enlaces */}
          <div className="space-y-4">
            <h5 className="text-white font-bold uppercase text-xs tracking-widest">
              Navegación
            </h5>
            <div className="grid grid-cols-1 gap-2 text-xs font-semibold">
              <Link href={`/`} className="hover:text-white transition-colors flex items-center">
                <ChevronRight className="h-3 w-3 mr-1 text-slate-600" /> Portada
              </Link>
              <Link href={`/about`} className="hover:text-white transition-colors flex items-center">
                <ChevronRight className="h-3 w-3 mr-1 text-slate-600" /> Institucional
              </Link>
              <Link href={`/sports`} className="hover:text-white transition-colors flex items-center">
                <ChevronRight className="h-3 w-3 mr-1 text-slate-600" /> Disciplinas
              </Link>
              <Link href={`/news`} className="hover:text-white transition-colors flex items-center">
                <ChevronRight className="h-3 w-3 mr-1 text-slate-600" /> Prensa
              </Link>
              <Link href={`/apply`} className="hover:text-white transition-colors flex items-center">
                <ChevronRight className="h-3 w-3 mr-1 text-slate-600" /> Asociarse
              </Link>
            </div>
          </div>
        </div>

        {/* Derechos de Autor */}
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-600 font-medium">
          <p>© {new Date().getFullYear()} {club.name.toUpperCase()}. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Plataforma provista por <Award className="h-3.5 w-3.5 text-blue-500" /> <strong className="text-slate-500">Clubify</strong>. Fomentando el deporte.
          </p>
        </div>
      </footer>
      <AdminFloatingButton />
    </div>
  );
}
