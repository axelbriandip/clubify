"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Iniciar sesión con la API de Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSuccessMsg("¡Inicio de sesión exitoso! Redireccionando...");
      
      // Redirigir al dashboard general del club
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      // Traducción básica de errores comunes de Supabase
      if (err.message.includes("Invalid login credentials")) {
        setErrorMsg("Credenciales de acceso incorrectas. Revisa tu email o contraseña.");
      } else {
        setErrorMsg(err.message || "Ocurrió un error inesperado al intentar ingresar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Círculos difuminados de fondo para dar efecto premium (glassmorphism background) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <h2 className="text-center text-4xl font-extrabold tracking-tight text-white">
          Clubify
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Ingresa al panel de control de tu club
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900/80 backdrop-blur-md py-8 px-4 shadow-2xl border border-slate-800 rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Mensajes de Alerta */}
            {errorMsg && (
              <div className="bg-red-950/50 border border-red-800 text-red-300 p-3 rounded-lg text-sm text-center">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-950/50 border border-emerald-800 text-emerald-300 p-3 rounded-lg text-sm text-center">
                {successMsg}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-200">
                Correo Electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-800 rounded-lg bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                  placeholder="ejemplo@club.com"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-200">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-800 rounded-lg bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Botón de Ingreso */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Ingresando..." : "Iniciar Sesión"}
              </button>
            </div>
          </form>

          {/* Enlace de Registro */}
          <div className="mt-6 text-center">
            <span className="text-sm text-slate-400">
              ¿Tu club no está registrado?{" "}
              <a href="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                Regístralo aquí
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
