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
    <div className="bg-white border-2 border-slate-900 p-8 md:p-12 max-w-4xl mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_var(--primary-club)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 relative overflow-hidden">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]"></div>

      {success ? (
        <div className="text-center space-y-4 py-4 relative z-10">
          <div className="inline-flex items-center justify-center h-12 w-12 bg-emerald-100 text-emerald-600 border-2 border-slate-900 mb-1">
            <CheckCircle className="h-6 w-6" />
          </div>
          <h4 className="font-oswald font-black text-xl text-slate-900 uppercase italic">¡Suscripción Confirmada!</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-bold font-oswald uppercase">
            Te has registrado con éxito en nuestro boletín oficial. Recibirás todos los comunicados en tu correo.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-700 underline mt-2 cursor-pointer font-oswald"
          >
            Registrar otra dirección
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center relative z-10">
          
          {/* Textos */}
          <div className="lg:col-span-3 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-club)] font-oswald">
              Boletín Informativo
            </span>
            <h3 className="font-oswald font-black text-2xl md:text-3xl text-slate-900 uppercase italic">
              Suscribite a las Novedades
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md font-medium">
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
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border-2 border-slate-900 text-slate-900 text-xs focus:outline-none focus:bg-white focus:ring-1 focus:ring-[var(--primary-club)] placeholder-slate-400 font-bold transition-all"
                  placeholder="tu.email@correo.com"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !email}
                style={{ backgroundColor: primaryColor }}
                className="px-6 py-3 border-2 border-slate-900 text-xs font-black uppercase tracking-wider text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 shrink-0 cursor-pointer"
              >
                {submitting ? "Enviando" : "Suscripción"}
              </button>
            </form>

            {error && (
              <div className="bg-red-50 border-2 border-red-950 text-red-700 p-3 text-[10px] font-black uppercase font-oswald flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
