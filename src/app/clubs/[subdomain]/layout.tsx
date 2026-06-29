import React from "react";

interface ClubLayoutProps {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}

export default async function ClubLayout({ children, params }: ClubLayoutProps) {
  // Await params como requiere la estructura moderna de Next.js 15
  const { subdomain } = await params;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Cabecera pública temporal para probar el multi-tenant */}
      <header className="bg-white border-b p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="font-bold text-xl uppercase tracking-wider text-slate-800">
            {subdomain} - Portal Oficial
          </h1>
          <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-3 py-1 rounded-full">
            Sitio Autogenerado
          </span>
        </div>
      </header>

      {/* Contenido dinámico del sitio del club */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-6">
        {children}
      </main>

      {/* Pie de página estándar */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p>
          © {new Date().getFullYear()} {subdomain.replace("-", " ").toUpperCase()}. 
          Todos los derechos reservados.
        </p>
        <p className="text-xs text-slate-600 mt-2">
          Tecnología provista por Clubify
        </p>
      </footer>
    </div>
  );
}
