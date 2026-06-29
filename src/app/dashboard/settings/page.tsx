"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Settings,
  CreditCard,
  Users,
  ShieldAlert,
  ArrowRight,
  Database,
  CheckCircle,
} from "lucide-react";

export default function SettingsDashboard() {
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estados mock para control de la V1
  const [collaborators, setCollaborators] = useState([
    { name: "Juan Pérez", email: "juan.perez@gmail.com", role: "Owner", status: "Active" },
    { name: "María Gómez", email: "maria.gomez@gmail.com", role: "Editor Prensa", status: "Active" },
  ]);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        setLoading(true);
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        const res = await fetch(`/api/user/club?userId=${authUser.id}`);
        const result = await res.json();
        if (res.ok && result.success) {
          setClub(result.club);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, []);

  if (loading && !club) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Configuración del SaaS</h1>
        <p className="text-sm text-slate-400">
          Administra la suscripción de tu club, accesos de colaboradores y preferencias generales del sistema.
        </p>
      </div>

      {/* Grid de Secciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA 1 & 2: COLABORADORES & SEGURIDAD */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tarjeta: Colaboradores */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Users className="h-4 w-4 text-blue-500" />
              Colaboradores y Roles
            </h3>

            <div className="overflow-hidden border border-slate-800 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-800">
                    <th className="p-3">Nombre</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Rol del Sistema</th>
                    <th className="p-3 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {collaborators.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-850/30 transition-colors">
                      <td className="p-3 font-bold text-white">{c.name}</td>
                      <td className="p-3 text-slate-400">{c.email}</td>
                      <td className="p-3">
                        <span className="bg-slate-950 border border-slate-850 text-slate-300 px-2 py-0.5 rounded font-semibold">
                          {c.role}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded-full font-bold uppercase">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-right pt-2">
              <button 
                onClick={() => alert("Función disponible en el Plan Pro")}
                className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors font-bold"
              >
                Invitar Colaborador (Pro)
              </button>
            </div>
          </div>

          {/* Tarjeta: Base de Datos */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Database className="h-4 w-4 text-purple-500" />
              Resguardo de Información
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Exporta los padrones de socios preinscriptos y fichas médicas cargadas de jugadores en formatos planos para contabilidad interna.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => alert("Exportando registros en Excel...")}
                className="text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-lg transition-colors font-bold flex items-center gap-1.5"
              >
                Exportar Socios (.CSV)
              </button>
              <button
                onClick={() => alert("Exportando base de jugadores...")}
                className="text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-lg transition-colors font-bold flex items-center gap-1.5"
              >
                Fichas Deportivas (.CSV)
              </button>
            </div>
          </div>
        </div>

        {/* COLUMNA 3: DETALLES DE FACTURACIÓN SAAS */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md space-y-4">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <CreditCard className="h-4 w-4 text-emerald-500" />
              Suscripción Clubify
            </h3>

            {/* Plan Info */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Plan Actual</span>
                <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-900 px-2 py-0.5 rounded font-black uppercase">
                  Plan Básico (Subdominio)
                </span>
              </div>
              <div className="h-px bg-slate-850 my-2"></div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Ciclo de Facturación</span>
                <span className="text-slate-200 font-bold">Mensual</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Importe</span>
                <span className="text-white font-black text-sm">$25.00 USD / mes</span>
              </div>
            </div>

            {/* Trial Info */}
            <div className="bg-emerald-950/30 border border-emerald-900/60 p-4 rounded-xl text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-emerald-400">Prueba Activa de 30 días</strong>
                Tu período de prueba finaliza el 29/07/2026. No se realizarán cargos hasta esa fecha.
              </div>
            </div>

            {/* Botón Upgrade */}
            <div className="pt-2">
              <button
                onClick={() => alert("Redireccionando a pasarela de cobro...")}
                className="w-full flex justify-center items-center py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-lg transition-colors shadow-md shadow-blue-900/20"
              >
                Subir a Plan Pro (Dominio Propio)
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
