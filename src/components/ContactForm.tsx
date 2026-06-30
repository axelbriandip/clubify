"use client";

import React, { useState } from "react";
import { Mail, Phone, User, Send, CheckCircle, AlertCircle } from "lucide-react";

interface ContactFormProps {
  clubId: string;
  primaryColor: string;
}

export default function ContactForm({ clubId, primaryColor }: ContactFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Por favor, completa los campos requeridos.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId,
          ...form,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSuccess(true);
        setForm({ name: "", email: "", phone: "", message: "" });
      } else {
        setError(result.error || "Ocurrió un error al enviar el mensaje.");
      }
    } catch (err) {
      setError("Error de red. Inténtalo de nuevo más tarde.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border-2 border-slate-900 p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_var(--primary-club)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150">
      {success ? (
        <div className="text-center py-10 space-y-4">
          <div className="inline-flex items-center justify-center h-16 w-16 bg-emerald-100 text-emerald-600 border-2 border-slate-900 mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h4 className="font-oswald font-black text-xl text-slate-900 uppercase italic">¡Mensaje Enviado!</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-bold font-oswald uppercase">
            Hemos recibido tu consulta de forma exitosa. Nos pondremos en contacto a la brevedad.
          </p>
          <button
            onClick={() => setSuccess(false)}
            style={{ backgroundColor: primaryColor }}
            className="px-6 py-2.5 border-2 border-slate-900 text-xs font-black uppercase text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
          >
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-oswald font-black text-xl text-slate-900 uppercase border-b-2 border-slate-900 pb-3 italic">
            Envianos un Mensaje
          </h3>

          {error && (
            <div className="bg-red-50 border-2 border-red-950 text-red-700 p-4 text-xs font-black uppercase font-oswald flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-oswald">Nombre Completo *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border-2 border-slate-900 text-slate-900 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[var(--primary-club)] font-bold transition-all"
                  placeholder="Tu nombre completo"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-oswald">Correo Electrónico *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border-2 border-slate-900 text-slate-900 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[var(--primary-club)] font-bold transition-all"
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-oswald">Teléfono (Opcional)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-600">
                <Phone className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border-2 border-slate-900 text-slate-900 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[var(--primary-club)] font-bold transition-all"
                placeholder="Código de área + número"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 font-oswald">Consulta o Comentario *</label>
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-900 text-slate-900 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[var(--primary-club)] font-bold transition-all resize-none"
              placeholder="Escribe tu consulta detallada aquí..."
            />
          </div>

          <div className="pt-2 text-right">
            <button
              type="submit"
              disabled={submitting}
              style={{ backgroundColor: primaryColor }}
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-slate-900 text-xs font-black uppercase tracking-wider text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5 mr-2" />
              {submitting ? "Enviando..." : "Enviar Consulta"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
