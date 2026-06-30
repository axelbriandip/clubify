"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, UserCheck, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function ClubApplyPage() {
  const router = useRouter();
  const params = useParams();
  const subdomain = params.subdomain as string;

  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Campos del Formulario
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    documentId: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    address: "",
    desiredTier: "Básico",
  });

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/user/club?slug=${subdomain}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
          setClub(result.club);
        } else {
          setErrorMsg("No se pudo cargar la información del club.");
        }
      } catch (err) {
        console.error("Error al cargar club en solicitud:", err);
        setErrorMsg("Error de conexión al buscar el club.");
      } finally {
        setLoading(false);
      }
    };

    if (subdomain) {
      fetchClubData();
    }
  }, [subdomain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/member-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clubId: club.id,
          ...form,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSuccess(true);
      } else {
        throw new Error(result.error || "Error al enviar la solicitud.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error inesperado.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 text-sm font-semibold">Cargando formulario institucional...</p>
      </div>
    );
  }

  const primaryColor = club?.settings?.primaryColor || "#0284c7";
  const secondaryColor = club?.settings?.secondaryColor || "#0f172a";

  return (
    <div 
      className="bg-slate-50 min-h-screen text-slate-800 flex flex-col font-sans"
      style={{
        "--primary-club": primaryColor,
        "--secondary-club": secondaryColor,
      } as React.CSSProperties}
    >
      {/* Cabecera Superior */}
      <header className="bg-slate-900 text-white py-8 px-6 border-b border-slate-800">
        <div className="absolute inset-0 opacity-40 bg-[var(--primary-club)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
        <div className="relative max-w-4xl mx-auto flex justify-between items-center z-10">
          <Link
            href={`/`}
            className="inline-flex items-center text-xs font-bold text-slate-350 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Volver a Portada
          </Link>
          <span className="text-xs bg-slate-950 text-white font-extrabold px-3 py-1 rounded-full border border-slate-800 uppercase">
            {club ? club.name.toUpperCase() : ""}
          </span>
        </div>
      </header>

      {/* Área del Formulario */}
      <main className="flex-grow max-w-2xl w-full mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-xl space-y-8">
          
          {success ? (
            <div className="text-center py-12 space-y-4 animate-fade-in">
              <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 mb-4 animate-pulse">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase font-outfit">
                ¡Solicitud Recibida!
              </h2>
              <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
                Tu solicitud de preinscripción para asociarte al club fue registrada correctamente en nuestra base de datos.
                La comisión directiva revisará tu postulación y se contactará contigo vía email para coordinar el cobro y carnet.
              </p>
              <div className="pt-4">
                <Link
                  href={`/`}
                  className="px-6 py-2.5 bg-[var(--primary-club)] hover:brightness-110 text-white font-extrabold text-xs rounded-full shadow-md transition-all uppercase tracking-wider"
                >
                  Volver al Portal
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Encabezado */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight font-outfit">
                  Preinscripción de Socios
                </h2>
                <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
                  Completa el formulario de postulación inicial. El club confirmará tu alta una vez evaluado el cupo.
                </p>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs text-center font-bold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Datos del Solicitante */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-1.5 flex items-center">
                    <UserCheck className="h-4.5 w-4.5 mr-1.5 text-[var(--primary-club)]" />
                    Datos Personales
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nombre</label>
                      <input
                        type="text"
                        required
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[var(--primary-club)] focus:ring-1 focus:ring-[var(--primary-club)] font-semibold transition-all"
                        placeholder="Martín"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-505 uppercase mb-1">Apellido</label>
                      <input
                        type="text"
                        required
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[var(--primary-club)] focus:ring-1 focus:ring-[var(--primary-club)] font-semibold transition-all"
                        placeholder="Gómez"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-505 uppercase mb-1">DNI / Pasaporte</label>
                      <input
                        type="text"
                        required
                        value={form.documentId}
                        onChange={(e) => setForm({ ...form, documentId: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[var(--primary-club)] focus:ring-1 focus:ring-[var(--primary-club)] font-semibold transition-all"
                        placeholder="35.876.543"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-505 uppercase mb-1">Fecha de Nacimiento</label>
                      <input
                        type="date"
                        required
                        value={form.dateOfBirth}
                        onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[var(--primary-club)] focus:ring-1 focus:ring-[var(--primary-club)] font-semibold transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Información de Contacto */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-1.5 flex items-center">
                    <Mail className="h-4.5 w-4.5 mr-1.5 text-[var(--primary-club)]" />
                    Contacto
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1">Correo Electrónico</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[var(--primary-club)] focus:ring-1 focus:ring-[var(--primary-club)] font-semibold transition-all"
                        placeholder="martin.gomez@gmail.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1">Teléfono</label>
                      <input
                        type="text"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[var(--primary-club)] focus:ring-1 focus:ring-[var(--primary-club)] font-semibold transition-all"
                        placeholder="341-3123456"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-550 uppercase mb-1">Dirección de Residencia</label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[var(--primary-club)] focus:ring-1 focus:ring-[var(--primary-club)] font-semibold transition-all"
                      placeholder="Av. Pellegrini 1200, Rosario"
                    />
                  </div>
                </div>

                {/* 3. Categoría de Socio */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-1.5 flex items-center">
                    <ShieldCheck className="h-4.5 w-4.5 mr-1.5 text-[var(--primary-club)]" />
                    Categoría de Membresía
                  </h3>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Plan de Socio Deseado</label>
                    <select
                      value={form.desiredTier}
                      onChange={(e) => setForm({ ...form, desiredTier: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-205 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[var(--primary-club)]"
                    >
                      <option value="Básico">Socio Activo General (Básico)</option>
                      <option value="Socio Grupo Familiar">Socio Familiar (Descuentos Grupo)</option>
                      <option value="Socio Deportivo (Federado)">Socio Deportivo (Habilitación Competencia)</option>
                      <option value="Socio Menor (Cadete)">Socio Cadete / Infantil</option>
                    </select>
                  </div>
                </div>

                {/* Botón de Enviar */}
                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{ backgroundColor: primaryColor }}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-xs font-extrabold uppercase tracking-wider text-white hover:brightness-110 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer font-outfit"
                  >
                    {submitting ? "Enviando solicitud..." : "Enviar Postulación"}
                  </button>
                </div>
              </form>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
