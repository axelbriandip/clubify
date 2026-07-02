import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Guardamos el path con sus parámetros de búsqueda (si existen)
  const searchParams = url.searchParams.toString();
  const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

  // Definimos los dominios raíz de nuestro SaaS
  // En local es localhost:3000 y en producción será clubify.app
  const rootDomains = ["localhost:3000", "clubify.app"];
  
  let currentHost = hostname;
  
  // Verificamos si el host actual es un subdominio de nuestros dominios raíz
  rootDomains.forEach((domain) => {
    if (hostname.endsWith(`.${domain}`)) {
      // Si termina en .localhost:3000, extraemos la parte del subdominio (ej: "san-martin")
      currentHost = hostname.replace(`.${domain}`, "");
    } else if (hostname === domain) {
      // Si es exactamente el dominio raíz (ej: "localhost:3000"), no hay subdominio
      currentHost = "";
    }
  });

  // Si no hay subdominio, o es "www", dejamos que la ruta continúe a la landing page / login
  if (currentHost === "" || currentHost === "www") {
    return NextResponse.next();
  }

  // Excluir rutas globales que no corresponden al portal público del club
  // para que resuelvan directamente en el subdominio (ej: olimpo.localhost:3000/login)
  const globalPaths = ["/login", "/register", "/dashboard"];
  const isGlobalPath = globalPaths.some(
    (p) => url.pathname === p || url.pathname.startsWith(`${p}/`)
  );
  if (isGlobalPath) {
    return NextResponse.next();
  }

  // Evitamos bucles de redirección si por alguna razón la URL interna ya apunta a /clubs
  if (url.pathname.startsWith("/clubs")) {
    return NextResponse.next();
  }

  // Reescribimos la solicitud internamente a /clubs/[subdominio]/path
  // El usuario seguirá viendo "subdominio.localhost:3000" en su navegador
  return NextResponse.rewrite(
    new URL(`/clubs/${currentHost}${path}`, request.url)
  );
}

// Configuración del matcher para evitar interceptar archivos estáticos y APIs
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml, robots.txt (SEO files)
     * - Images/files with extensions (svg, png, jpg, webp, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
};
