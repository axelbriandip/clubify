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
    <div className="bg-white border border-slate-200/60 p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300">
      {success ? (
        <div className="text-center py-10 space-y-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 text-emerald-500 mb-2">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h4 className="font-outfit font-black text-xl text-slate-900 uppercase">¡Mensaje Enviado!</h4>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Hemos recibido tu consulta de forma exitosa. Nos pondremos en contacto contigo a la brevedad.
          </p>
          <button
            onClick={() => setSuccess(false)}
            style={{ backgroundColor: primaryColor }}
            className="px-6 py-2 rounded-full text-xs font-black uppercase text-white hover:brightness-110 transition-all mt-4 cursor-pointer"
          >
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-outfit font-black text-xl text-slate-900 uppercase border-b border-slate-100 pb-3">
            Envianos un Mensaje
          </h3>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-605 p-4 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nombre Completo *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-55 border border-slate-200 text-slate-900 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary-club)] focus:bg-white transition-all font-semibold"
                  placeholder="Tu nombre completo"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Correo Electrónico *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-55 border border-slate-200 text-slate-900 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary-club)] focus:bg-white transition-all font-semibold"
                  placeholder="ejemplo@correo.com"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Teléfono (Opcional)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Phone className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-55 border border-slate-200 text-slate-900 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary-club)] focus:bg-white transition-all font-semibold"
                placeholder="Código de área + número"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Consulta o Comentario *</label>
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-55 border border-slate-200 text-slate-900 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary-club)] focus:bg-white transition-all resize-none font-semibold"
              placeholder="Escribe tu consulta detallada aquí..."
            />
          </div>

          <div className="pt-2 text-right">
            <button
              type="submit"
              disabled={submitting}
              style={{ backgroundColor: primaryColor }}
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider text-white hover:brightness-110 disabled:opacity-50 transition-all shadow-md shadow-[var(--primary-club)]/15 cursor-pointer"
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
