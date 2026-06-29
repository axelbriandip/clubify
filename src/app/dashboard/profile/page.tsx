"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Shield, Save, Eye, Layout, Mail, Phone, MapPin, CheckCircle } from "lucide-react";

export default function ProfileDashboard() {
  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Estado del Formulario
  const [form, setForm] = useState({
    primaryColor: "#0284c7",
    secondaryColor: "#0f172a",
    fontFamily: "Inter",
    heroTitle: "",
    heroSubtitle: "",
    heroCtaText: "",
    heroCtaLink: "",
    contactEmail: "",
    contactPhone: "",
    whatsappNumber: "",
    addressText: "",
  });

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
        
        if (activeClub.settings) {
          const s = activeClub.settings;
          setForm({
            primaryColor: s.primaryColor || "#0284c7",
            secondaryColor: s.secondaryColor || "#0f172a",
            fontFamily: s.fontFamily || "Inter",
            heroTitle: s.heroTitle || "",
            heroSubtitle: s.heroSubtitle || "",
            heroCtaText: s.heroCtaText || "",
            heroCtaLink: s.heroCtaLink || "",
            contactEmail: s.contactEmail || "",
            contactPhone: s.contactPhone || "",
            whatsappNumber: s.whatsappNumber || "",
            addressText: s.addressText || "",
          });
        }
      }
    } catch (err) {
      console.error("Error al cargar configuraciones visuales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/user/club", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId: club.id,
          ...form,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSuccessMsg("¡Configuración visual guardada correctamente! Los cambios ya están en línea.");
        loadData();
      } else {
        throw new Error(result.error || "Ocurrió un error al intentar guardar.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al procesar la solicitud.");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !club) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Identidad del Club</h1>
          <p className="text-sm text-slate-400">
            Define la paleta de colores, tipografía, textos de portada y la información de contacto oficial de tu web.
          </p>
        </div>

        {/* Enlace rápido a ver la web pública */}
        <a
          href={club ? `http://${club.slug}.localhost:3000` : "#"}
          target="_blank"
          rel="noreferrer"
          className="flex items-center px-4 py-2 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors shadow"
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Sitio Público
        </a>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-4 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-950/60 border border-red-800 text-red-300 p-4 rounded-xl text-sm">
          {errorMsg}
        </div>
      )}

      {/* Formulario Principal */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA 1 & 2: CONFIGURACIÓN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tarjeta: Paleta y Tipografía */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-md">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Layout className="h-4 w-4 text-blue-500" />
              1. Apariencia Visual
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Color Primario</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="h-9 w-9 bg-transparent border-0 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.primaryColor}
                    onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Color Secundario</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.secondaryColor}
                    onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                    className="h-9 w-9 bg-transparent border-0 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.secondaryColor}
                    onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1.5">Tipografía</label>
                <select
                  value={form.fontFamily}
                  onChange={(e) => setForm({ ...form, fontFamily: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                >
                  <option value="Inter">Inter (Limpia y moderna)</option>
                  <option value="Outfit">Outfit (Deportiva y futurista)</option>
                  <option value="Roboto">Roboto (Clásica y legible)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tarjeta: Textos del Hero Banner */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-md">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Shield className="h-4 w-4 text-amber-500" />
              2. Portada / Hero Banner
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Título de Portada</label>
                <input
                  type="text"
                  value={form.heroTitle}
                  onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                  placeholder={`Club Atlético ${club.name}`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Subtítulo o Lema</label>
                <input
                  type="text"
                  value={form.heroSubtitle}
                  onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                  placeholder="Bienvenidos al sitio oficial de nuestra institución..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Texto del Botón CTA (Llamado a Acción)</label>
                  <input
                    type="text"
                    value={form.heroCtaText}
                    onChange={(e) => setForm({ ...form, heroCtaText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                    placeholder="Asociate Aquí"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Enlace del Botón CTA</label>
                  <input
                    type="text"
                    value={form.heroCtaLink}
                    onChange={(e) => setForm({ ...form, heroCtaLink: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                    placeholder="/apply (Ruta de preinscripción de socios)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta: Información de Contacto */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-md">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Mail className="h-4 w-4 text-emerald-500" />
              3. Información de Contacto Público
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email Público</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                  placeholder="contacto@club.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Teléfono Secretaría</label>
                <input
                  type="text"
                  value={form.contactPhone}
                  onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                  placeholder="341-4567890"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Número de WhatsApp (Sin +)</label>
                <input
                  type="text"
                  value={form.whatsappNumber}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                  placeholder="5493416123456"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Dirección del Club</label>
              <input
                type="text"
                value={form.addressText}
                onChange={(e) => setForm({ ...form, addressText: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                placeholder="Av. Principal 1500, Rosario, Santa Fe"
              />
            </div>
          </div>

        </div>

        {/* COLUMNA 3: PREVISUALIZACIÓN EN VIVO (MOCK) */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md sticky top-6 space-y-4">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider border-b border-slate-800 pb-2">
              Previsualización de Estilos
            </h3>

            {/* Simulación de Botón Público */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Aspecto de Botones Principales</span>
              <button
                type="button"
                style={{ backgroundColor: form.primaryColor }}
                className="px-6 py-2 rounded-full text-white font-extrabold text-xs shadow-md brightness-100 hover:brightness-110 transition-all cursor-default"
              >
                {form.heroCtaText || "Asociate Aquí"}
              </button>
            </div>

            {/* Simulación de Detalles de Marca */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <span className="text-[10px] text-slate-500 uppercase font-bold block text-center">Aspecto de Detalles</span>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">Menú Deportes</span>
                <span style={{ color: form.primaryColor }} className="font-extrabold">
                  Primera División
                </span>
              </div>
              <div className="h-px bg-slate-800"></div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">Detalle Cabecera</span>
                <span style={{ borderColor: form.primaryColor }} className="border-b-2 pb-0.5 font-bold">
                  Fixture
                </span>
              </div>
            </div>

            {/* Botón de Enviar Formulario Real */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
