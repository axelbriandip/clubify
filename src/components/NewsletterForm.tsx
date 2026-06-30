"use client";

import React, { useState } from "react";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";

interface NewsletterFormProps {
  clubId: string;
  primaryColor: string;
}

export default function NewsletterForm({ clubId, primaryColor }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId,
          email,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSuccess(true);
        setEmail("");
      } else {
        setError(result.error || "Ocurrió un error al registrar tu suscripción.");
      }
    } catch (err) {
      setError("Error de red. Inténtalo de nuevo más tarde.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 max-w-4xl mx-auto shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]"></div>

      {success ? (
        <div className="text-center space-y-4 py-4 relative z-10">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 mb-1">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h4 className="font-outfit font-black text-xl text-slate-900 uppercase">¡Suscripción Confirmada!</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Te has registrado con éxito en nuestro boletín oficial. A partir de ahora recibirás todos los comunicados de prensa en tu casilla de correo.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-650 underline mt-2 cursor-pointer"
          >
            Registrar otra dirección
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center relative z-10">
          
          {/* Textos */}
          <div className="lg:col-span-3 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-club)]">
              Boletín Informativo
            </span>
            <h3 className="font-outfit font-black text-2xl md:text-3xl text-slate-900 uppercase tracking-tight leading-none">
              Suscribite a las Novedades
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              Recibí de forma directa en tu correo electrónico los comunicados de prensa, crónicas de partidos e información institucional del club.
            </p>
          </div>

          {/* Formulario */}
          <div className="lg:col-span-2 w-full space-y-3">
            <form onSubmit={handleSubmit} className="flex gap-2 w-full">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary-club)] placeholder-slate-450 font-semibold transition-all"
                  placeholder="tu.email@correo.com"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !email}
                style={{ backgroundColor: primaryColor }}
                className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white hover:brightness-110 disabled:opacity-50 transition-all shadow-md shrink-0 shadow-[var(--primary-club)]/15 cursor-pointer"
              >
                {submitting ? "Enviando" : "Suscripción"}
              </button>
            </form>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-[10px] flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                {error}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
