"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Users,
  Trophy,
  Calendar,
  UserPlus,
  ArrowUpRight,
} from "lucide-react";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estado para guardar las métricas calculadas
  const [statsData, setStatsData] = useState({
    peopleCount: 0,
    disciplinesCount: 0,
    matchesCount: 0,
    pendingApplicationsCount: 0,
  });

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser);
        
        // Traer datos del club
        const response = await fetch(`/api/user/club?userId=${authUser.id}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
          const activeClub = result.club;
          setClub(activeClub);

          // Cargar estadísticas calculadas en tiempo real
          const statsRes = await fetch(`/api/dashboard/stats?clubId=${activeClub.id}`);
          const statsResult = await statsRes.json();
          if (statsRes.ok && statsResult.success) {
            setStatsData(statsResult.data);
          }
        }
      }
    } catch (err) {
      console.error("Error al cargar datos del usuario:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Generar las métricas dinámicas basadas en los datos provistos por la API
  const stats = [
    {
      name: "Socios & Deportistas",
      value: statsData.peopleCount.toString(),
      statusText: "Activos en el padrón",
      icon: Users,
      color: "from-blue-600/20 to-blue-900/10 border-blue-900/50",
      iconColor: "text-blue-500",
    },
    {
      name: "Disciplinas Activas",
      value: statsData.disciplinesCount.toString(),
      statusText: "Deportes federados",
      icon: Trophy,
      color: "from-amber-600/20 to-amber-900/10 border-amber-900/50",
      iconColor: "text-amber-500",
    },
    {
      name: "Partidos este Mes",
      value: statsData.matchesCount.toString(),
      statusText: "Disputados / Agendados",
      icon: Calendar,
      color: "from-emerald-600/20 to-emerald-900/10 border-emerald-900/50",
      iconColor: "text-emerald-500",
    },
    {
      name: "Preinscripciones",
      value: statsData.pendingApplicationsCount.toString(),
      statusText: "Solicitudes pendientes",
      icon: UserPlus,
      color: "from-pink-600/20 to-pink-900/10 border-pink-900/50",
      iconColor: "text-pink-500",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Sección Bienvenida */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <h1 className="text-3xl font-extrabold text-white">
          ¡Hola, {user ? user.email.split("@")[0] : "Admin"}!
        </h1>
        <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
          Bienvenido al panel de control de <strong className="text-blue-400">{club ? club.name : "tu club"}</strong>.
          Desde aquí puedes gestionar el sitio web público, cargar deportes, planteles de jugadores y mantener informados a tus socios.
        </p>
      </div>

      {/* Grid de Tarjetas de Métricas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`relative bg-gradient-to-br ${stat.color} border p-5 rounded-2xl shadow-md overflow-hidden flex flex-col justify-between h-36`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {stat.name}
                </p>
                <p className="text-3xl font-black text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 ${stat.iconColor}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            
            <div className="flex justify-between items-center text-xs border-t border-slate-800/60 pt-3 mt-3">
              <span className="text-slate-500">Estado</span>
              <span className="font-bold text-slate-350">
                {stat.statusText}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Fila inferior de Accesos Rápidos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Acceso Rápido */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md">
          <h3 className="text-lg font-bold text-white mb-4">Primeros Pasos Recomendados</h3>
          <ul className="space-y-3">
            {[
              { text: "Completa la configuración visual y colores en Identidad", href: "/dashboard/profile" },
              { text: "Crea tus primeras Disciplinas deportivas", href: "/dashboard/sports" },
              { text: "Publica una noticia o galería en Prensa", href: "/dashboard/media" },
            ].map((item, index) => (
              <li key={index} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/50 hover:border-blue-900/40 transition-colors group">
                <span className="text-sm text-slate-300">{item.text}</span>
                <a
                  href={item.href}
                  className="p-1 rounded bg-blue-950 border border-blue-900/30 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Estado de la Web */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Estado del Sitio Web</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              Tu portal web público se encuentra en línea y es accesible desde el subdominio asignado.
            </p>
          </div>
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Tu sitio web público es:</span>
              <a
                href={club ? `http://${club.slug}.localhost:3000` : "#"}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-bold text-blue-400 hover:underline"
              >
                {club ? `${club.slug}.localhost:3000` : "Cargando..."}
              </a>
            </div>
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
