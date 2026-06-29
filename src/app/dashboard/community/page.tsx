"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  FileText,
  AlertCircle,
} from "lucide-react";

export default function CommunityDashboard() {
  const [club, setClub] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Estados del modal de rechazo
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [activeFilter, setActiveFilter] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const clubRes = await fetch(`/api/user/club?userId=${authUser.id}`);
      const clubResult = await clubRes.json();
      if (clubRes.ok && clubResult.success) {
        setClub(clubResult.club);

        const appsRes = await fetch(`/api/member-applications?clubId=${clubResult.club.id}`);
        const appsResult = await appsRes.json();
        if (appsRes.ok && appsResult.success) {
          setApplications(appsResult.data);
        }
      }
    } catch (err) {
      console.error("Error al cargar solicitudes de socios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED", reason?: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/member-applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status,
          rejectionReason: reason || null,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setShowRejectModal(false);
        setRejectionReason("");
        setSelectedAppId(null);
        loadData(); // Recargar datos consolidados
      } else {
        alert(result.error || "Error al actualizar la solicitud.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !club) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Filtrar solicitudes localmente
  const filteredApps = applications.filter((app) => app.status === activeFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera del Módulo */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Comunidad y Membresías</h1>
        <p className="text-sm text-slate-400">
          Revisa, aprueba o descarta las solicitudes de preinscripción de nuevos socios enviadas desde la web pública.
        </p>
      </div>

      {/* Selectores de Filtro de Estados */}
      <div className="flex border-b border-slate-800 gap-4">
        {[
          { name: "Pendientes", status: "PENDING", icon: Clock, color: "text-amber-500" },
          { name: "Aprobados", status: "APPROVED", icon: CheckCircle, color: "text-emerald-500" },
          { name: "Rechazados", status: "REJECTED", icon: XCircle, color: "text-red-500" },
        ].map((tab) => {
          const isActive = activeFilter === tab.status;
          return (
            <button
              key={tab.status}
              onClick={() => setActiveFilter(tab.status as any)}
              className={`flex items-center pb-3 text-sm font-bold border-b-2 transition-colors px-1 ${
                isActive
                  ? "border-blue-600 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <tab.icon className={`h-4 w-4 mr-2 ${tab.color}`} />
              {tab.name}
              <span className="ml-2 bg-slate-900 border border-slate-800 text-[10px] text-slate-400 px-2 py-0.5 rounded-full">
                {applications.filter((a) => a.status === tab.status).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Listado de Solicitudes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        {filteredApps.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <AlertCircle className="h-12 w-12 mx-auto text-slate-700 mb-3" />
            <p className="text-sm font-bold">No hay solicitudes en esta sección.</p>
            <p className="text-xs mt-1">Las nuevas postulaciones se listarán aquí automáticamente.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="p-4">Solicitante</th>
                <th className="p-4">DNI / F. Nac.</th>
                <th className="p-4">Contacto</th>
                <th className="p-4">Plan Solicitado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-bold text-white">
                    {app.lastName}, {app.firstName}
                    <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                      Ingreso: {new Date(app.createdAt).toLocaleDateString("es-AR")}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">
                    <span className="block text-xs">DNI: {app.documentId}</span>
                    <span className="text-[10px] text-slate-500">
                      Nacimiento: {new Date(app.dateOfBirth).toLocaleDateString("es-AR")}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">
                    <div className="flex items-center text-xs gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                      {app.email}
                    </div>
                    {app.phone && (
                      <div className="flex items-center text-[10px] text-slate-500 gap-1.5 mt-1">
                        <Phone className="h-3.5 w-3.5" />
                        {app.phone}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-slate-300 font-medium">
                    <span className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
                      {app.membershipTierDesired || "General"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {app.status === "PENDING" && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleUpdateStatus(app.id, "APPROVED")}
                          disabled={updatingId !== null}
                          className="flex items-center text-xs bg-emerald-950 border border-emerald-800 text-emerald-400 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors font-bold disabled:opacity-50"
                        >
                          <UserCheck className="h-3.5 w-3.5 mr-1" />
                          Aprobar
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppId(app.id);
                            setShowRejectModal(true);
                          }}
                          disabled={updatingId !== null}
                          className="flex items-center text-xs bg-red-950 border border-red-900/60 text-red-400 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors font-bold disabled:opacity-50"
                        >
                          <UserX className="h-3.5 w-3.5 mr-1" />
                          Rechazar
                        </button>
                      </div>
                    )}
                    {app.status === "APPROVED" && (
                      <span className="text-xs bg-emerald-950 text-emerald-400 font-bold px-2.5 py-1 rounded-lg border border-emerald-900/40">
                        Alta de Socio Realizada
                      </span>
                    )}
                    {app.status === "REJECTED" && (
                      <div className="text-right">
                        <span className="text-xs bg-red-950 text-red-400 font-bold px-2.5 py-1 rounded-lg border border-red-900/40">
                          Rechazado
                        </span>
                        {app.rejectionReason && (
                          <span className="block text-[10px] text-slate-500 italic mt-1.5">
                            Motivo: {app.rejectionReason}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ======================= MODAL: RECHAZAR SOLICITUD ======================= */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-850 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-white mb-2">Rechazar Solicitud de Socio</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Por favor, indica la razón del rechazo. Este motivo quedará registrado en la ficha del postulante.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedAppId) {
                  handleUpdateStatus(selectedAppId, "REJECTED", rejectionReason);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Motivo</label>
                <textarea
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 h-24 resize-none"
                  placeholder="Cupo de disciplina lleno, datos de contacto incorrectos..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                    setSelectedAppId(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-lg transition-colors"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
