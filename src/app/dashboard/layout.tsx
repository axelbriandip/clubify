"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import {
  LayoutDashboard,
  Shield,
  Dribbble,
  FileText,
  Users2,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Estados de carga e información del club
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Enlaces de navegación del menú lateral
  const menuItems = [
    { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
    { name: "Identidad", href: "/dashboard/profile", icon: Shield },
    { name: "Deportes", href: "/dashboard/sports", icon: Dribbble },
    { name: "Prensa", href: "/dashboard/media", icon: FileText },
    { name: "Comunidad", href: "/dashboard/community", icon: Users2 },
    { name: "Configuración", href: "/dashboard/settings", icon: Settings },
  ];

  useEffect(() => {
    const checkAuthAndFetchClub = async () => {
      try {
        // 1. Verificar si hay usuario autenticado en Supabase
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
          router.push("/login");
          return;
        }

        setUser(authUser);

        // 2. Traer el club asociado al usuario desde nuestra API Prisma
        const response = await fetch(`/api/user/club?userId=${authUser.id}`);
        const result = await response.json();

        if (response.ok && result.success) {
          setClub(result.club);
        } else {
          console.error("Error al cargar club:", result.error);
        }
      } catch (err) {
        console.error("Error de autenticación:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchClub();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 text-sm font-semibold">Cargando tu panel de control...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* ---------------- SIDEBAR DE DESKTOP ---------------- */}
      <aside className="hidden md:flex md:w-64 md:flex-col bg-slate-900 border-r border-slate-800 shrink-0">
        {/* Cabecera del Sidebar */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <span className="font-extrabold text-lg text-white uppercase tracking-wider truncate">
            {club ? club.name : "Clubify Admin"}
          </span>
        </div>

        {/* Listado de Enlaces */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all group ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 transition-transform group-hover:scale-110 ${
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Botón Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-2.5 rounded-lg text-sm font-bold text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ---------------- SIDEBAR DE MÓVIL (MENÚ HAMBURGUESA) ---------------- */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop oscurecido */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Menú deslizante */}
          <div className="relative flex flex-col w-64 max-w-xs bg-slate-900 border-r border-slate-800 h-full z-50">
            <div className="absolute top-0 right-0 p-4">
              <button
                className="text-slate-400 hover:text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
              <span className="font-extrabold text-lg text-white uppercase tracking-wider truncate">
                {club ? club.name : "Clubify Admin"}
              </span>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50">
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2.5 rounded-lg text-sm font-bold text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- ÁREA DE CONTENIDO PRINCIPAL ---------------- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Cabecera superior del Dashboard */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-400 hover:text-white md:hidden mr-4"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold text-white capitalize">
              {pathname === "/dashboard" ? "Inicio" : pathname.split("/").pop()}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-3 py-1 rounded-full border border-slate-700">
              Admin: {user ? user.email : ""}
            </span>
          </div>
        </header>

        {/* Contenedor principal de vistas */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
