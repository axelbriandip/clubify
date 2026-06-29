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
  Users2,
  Send,
  Eye,
  Archive,
  Download,
} from "lucide-react";

export default function CommunityDashboard() {
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Selector del Tab Principal
  const [activeMainTab, setActiveMainTab] = useState<"APPLICATIONS" | "MESSAGES" | "NEWSLETTER">("APPLICATIONS");

  // Estados de datos
  const [applications, setApplications] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);

  // Filtros internos
  const [appFilter, setAppFilter] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [msgFilter, setMsgFilter] = useState<"PENDING" | "READ" | "ARCHIVED">("PENDING");

  // Estados del modal de rechazo de socios
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const clubRes = await fetch(`/api/user/club?userId=${authUser.id}`);
      const clubResult = await clubRes.json();
      if (clubRes.ok && clubResult.success) {
        const activeClub = clubResult.club;
        setClub(activeClub);

        // Cargar Solicitudes de Socios
        const appsRes = await fetch(`/api/member-applications?clubId=${activeClub.id}`);
        const appsResult = await appsRes.json();
        if (appsRes.ok && appsResult.success) {
          setApplications(appsResult.data);
        }

        // Cargar Mensajes de Contacto
        const msgRes = await fetch(`/api/contact?clubId=${activeClub.id}`);
        const msgResult = await msgRes.json();
        if (msgRes.ok && msgResult.success) {
          setMessages(msgResult.data);
        }

        // Cargar Suscriptores de Boletín
        const subRes = await fetch(`/api/newsletter?clubId=${activeClub.id}`);
        const subResult = await subRes.json();
        if (subRes.ok && subResult.success) {
          setSubscribers(subResult.data);
        }
      }
    } catch (err) {
      console.error("Error al cargar datos de comunidad:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Actualizar Estado de Solicitud de Socio
  const handleUpdateAppStatus = async (id: string, status: "APPROVED" | "REJECTED", reason?: string) => {
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
        loadData();
      } else {
        alert(result.error || "Error al actualizar la solicitud.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Actualizar Estado de Mensaje de Contacto (Leído/Archivado)
  const handleUpdateMsgStatus = async (id: string, status: "READ" | "ARCHIVED") => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        loadData();
      } else {
        alert(result.error || "Error al actualizar el mensaje.");
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

  // Filtrado local de listas
  const filteredApps = applications.filter((app) => app.status === appFilter);
  const filteredMsgs = messages.filter((msg) => msg.status === msgFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ---------------- CABECERA PRINCIPAL ---------------- */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Comunidad y Comunicación</h1>
        <p className="text-sm text-slate-400">
          Administra las relaciones con tu comunidad: solicitudes de socios, bandeja de mensajes y boletín de suscriptores.
        </p>
      </div>

      {/* ---------------- TABS PRINCIPALES DE SECCIÓN ---------------- */}
      <div className="flex border-b border-slate-800 gap-6">
        {[
          { id: "APPLICATIONS", label: "Preinscripción de Socios", icon: Users2, badge: applications.filter(a => a.status === "PENDING").length },
          { id: "MESSAGES", label: "Bandeja de Contacto", icon: Mail, badge: messages.filter(m => m.status === "PENDING").length },
          { id: "NEWSLETTER", label: "Boletín Informativo", icon: Send, badge: subscribers.length },
        ].map((tab) => {
          const isActive = activeMainTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id as any)}
              className={`flex items-center pb-3 text-sm font-bold border-b-2 transition-all px-1 cursor-pointer ${
                isActive
                  ? "border-blue-600 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <tab.icon className="h-4.5 w-4.5 mr-2" />
              {tab.label}
              {tab.badge > 0 && (
                <span className="ml-2 bg-blue-900/60 border border-blue-700/50 text-[10px] font-bold text-blue-300 px-2 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SOLICITUDES DE SOCIOS */}
      {/* ========================================================================= */}
      {activeMainTab === "APPLICATIONS" && (
        <div className="space-y-4">
          
          {/* Sub-filtros internos */}
          <div className="flex gap-2 bg-slate-900 border border-slate-850 p-1 rounded-xl max-w-sm">
            {[
              { name: "Pendientes", status: "PENDING", color: "text-amber-500" },
              { name: "Aprobados", status: "APPROVED", color: "text-emerald-500" },
              { name: "Rechazados", status: "REJECTED", color: "text-red-500" },
            ].map((subTab) => (
              <button
                key={subTab.status}
                onClick={() => setAppFilter(subTab.status as any)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  appFilter === subTab.status
                    ? "bg-slate-800 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {subTab.name}
              </button>
            ))}
          </div>

          {/* Tabla de Socios */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            {filteredApps.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <AlertCircle className="h-12 w-12 mx-auto text-slate-700 mb-3" />
                <p className="text-sm font-bold">No hay solicitudes en esta sección.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="p-4">Solicitante</th>
                    <th className="p-4">DNI / F. Nac.</th>
                    <th className="p-4">Contacto</th>
                    <th className="p-4">Plan Deseado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-850/20 transition-colors">
                      <td className="p-4 font-bold text-white">
                        {app.lastName}, {app.firstName}
                        <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                          Fecha: {new Date(app.createdAt).toLocaleDateString("es-AR")}
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
                      <td className="p-4">
                        <span className="bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
                          {app.membershipTierDesired || "Estándar"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {app.status === "PENDING" && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleUpdateAppStatus(app.id, "APPROVED")}
                              disabled={updatingId !== null}
                              className="flex items-center text-xs bg-emerald-950 border border-emerald-800 text-emerald-450 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors font-bold disabled:opacity-50"
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
                              className="flex items-center text-xs bg-red-950 border border-red-900/60 text-red-400 hover:bg-red-650 hover:text-white px-3 py-1.5 rounded-lg transition-colors font-bold disabled:opacity-50"
                            >
                              <UserX className="h-3.5 w-3.5 mr-1" />
                              Rechazar
                            </button>
                          </div>
                        )}
                        {app.status === "APPROVED" && (
                          <span className="text-xs bg-emerald-950 text-emerald-400 font-bold px-2.5 py-1 rounded-lg border border-emerald-900/40">
                            Ficha de Persona Creada
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BANDEJA DE CONTACTO */}
      {/* ========================================================================= */}
      {activeMainTab === "MESSAGES" && (
        <div className="space-y-4">
          {/* Sub-filtros internos */}
          <div className="flex gap-2 bg-slate-900 border border-slate-850 p-1 rounded-xl max-w-sm">
            {[
              { name: "No Leídos", status: "PENDING" },
              { name: "Leídos", status: "READ" },
              { name: "Archivados", status: "ARCHIVED" },
            ].map((subTab) => (
              <button
                key={subTab.status}
                onClick={() => setMsgFilter(subTab.status as any)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  msgFilter === subTab.status
                    ? "bg-slate-800 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {subTab.name}
              </button>
            ))}
          </div>

          {/* Listado de Mensajes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            {filteredMsgs.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Mail className="h-12 w-12 mx-auto text-slate-700 mb-3" />
                <p className="text-sm font-bold">No hay mensajes en esta sección.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="p-4">Remitente</th>
                    <th className="p-4">Mensaje</th>
                    <th className="p-4">Contacto</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {filteredMsgs.map((msg) => (
                    <tr key={msg.id} className="hover:bg-slate-850/20 transition-colors">
                      <td className="p-4 font-bold text-white max-w-[180px] truncate">
                        {msg.name}
                        <span className="block text-[10px] text-slate-500 font-normal mt-0.5">
                          Enviado: {new Date(msg.createdAt).toLocaleDateString("es-AR")}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 max-w-md">
                        <p className="text-xs whitespace-pre-wrap leading-relaxed">
                          {msg.message}
                        </p>
                      </td>
                      <td className="p-4 text-slate-400">
                        <div className="text-xs flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-slate-500" />
                          {msg.email}
                        </div>
                        {msg.phone && (
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3" />
                            {msg.phone}
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {msg.status === "PENDING" && (
                            <button
                              onClick={() => handleUpdateMsgStatus(msg.id, "READ")}
                              disabled={updatingId !== null}
                              className="flex items-center text-xs bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors font-bold disabled:opacity-50"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1 text-blue-400" />
                              Marcar Leído
                            </button>
                          )}
                          {msg.status !== "ARCHIVED" && (
                            <button
                              onClick={() => handleUpdateMsgStatus(msg.id, "ARCHIVED")}
                              disabled={updatingId !== null}
                              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                              title="Archivar mensaje"
                            >
                              <Archive className="h-4 w-4 text-amber-500" />
                            </button>
                          )}
                          {msg.status === "ARCHIVED" && (
                            <span className="text-xs text-slate-500 italic bg-slate-950 px-2.5 py-1 rounded border border-slate-850">
                              Archivado
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BOLETÍN INFORMATIVO (NEWSLETTER SUBSCRIBERS) */}
      {/* ========================================================================= */}
      {activeMainTab === "NEWSLETTER" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">
              Listado total de correos que solicitaron recibir novedades por e-mail.
            </span>
            <button
              onClick={() => {
                const csvContent = "data:text/csv;charset=utf-8," 
                  + ["Email,Fecha Registro,Estado"].concat(subscribers.map(s => `${s.email},${s.createdAt},Active`)).join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `newsletter_subscribers_${club.slug}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="flex items-center text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors font-bold"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" /> Exportar CSV
            </button>
          </div>

          {/* Tabla de Suscriptores */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            {subscribers.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Send className="h-12 w-12 mx-auto text-slate-700 mb-3" />
                <p className="text-sm font-bold">No hay suscriptores registrados aún.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="p-4">Correo Electrónico</th>
                    <th className="p-4">Fecha Suscripción</th>
                    <th className="p-4 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-850/20 transition-colors">
                      <td className="p-4 font-bold text-white">{sub.email}</td>
                      <td className="p-4 text-slate-450">
                        {new Date(sub.createdAt).toLocaleDateString("es-AR")} a las {new Date(sub.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} hs
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-[10px] bg-emerald-950 text-emerald-450 border border-emerald-900/60 px-2.5 py-0.5 rounded-full font-bold uppercase">
                          Suscripción Activa
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ======================= MODAL: RECHAZAR SOLICITUD DE SOCIO ======================= */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-850 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 relative animate-scale-in">
            <h3 className="text-lg font-bold text-white mb-2">Rechazar Solicitud de Socio</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Por favor, indica la razón del rechazo de la postulación.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedAppId) {
                  handleUpdateAppStatus(selectedAppId, "REJECTED", rejectionReason);
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
                  placeholder="Datos incompletos, arancel impago..."
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
