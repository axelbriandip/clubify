import React from "react";

interface ClubPageProps {
  params: Promise<{ subdomain: string }>;
}

export default async function ClubPage({ params }: ClubPageProps) {
  // Await params como requiere la estructura moderna de Next.js 15
  const { subdomain } = await params;

  return (
    <div className="bg-white rounded-xl shadow-md p-8 border max-w-2xl mx-auto mt-12 text-center">
      <h2 className="text-3xl font-extrabold text-slate-900 mb-4">
        ¡Bienvenidos a {subdomain.replace("-", " ").toUpperCase()}!
      </h2>
      
      <p className="text-slate-600 mb-6 leading-relaxed">
        Este es el sitio web público autogenerado para tu club. Actualmente estás 
        visualizando la plantilla base ejecutada bajo la arquitectura multi-tenant de la plataforma.
      </p>

      {/* Caja de información técnica para pruebas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 text-left">
        <h4 className="font-bold mb-2">Información de Depuración Multi-Tenant:</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Subdominio detectado:</strong>{" "}
            <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-xs font-semibold">{subdomain}</code>
          </li>
          <li>
            <strong>Ruta interna cargada:</strong>{" "}
            <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-xs font-semibold">src/app/clubs/[subdomain]/page.tsx</code>
          </li>
        </ul>
      </div>
    </div>
  );
}
