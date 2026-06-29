"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  
  // Estados del Formulario
  const [clubName, setClubName] = useState("");
  const [clubSlug, setClubSlug] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Estados de Control
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Validación básica del formato del subdominio (slug)
    const cleanSlug = clubSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
    if (cleanSlug.length < 3) {
      setErrorMsg("El subdominio debe tener al menos 3 caracteres alfanuméricos.");
      setLoading(false);
      return;
    }

    try {
      // 1. Registrar al usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("No se pudo obtener el usuario registrado.");
      }

      // 2. Enviar los datos del club a nuestra API de Prisma local
      const apiResponse = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: authData.user.id,
          email,
          firstName,
          lastName,
          clubName,
          clubSlug: cleanSlug,
        }),
      });

      const apiResult = await apiResponse.json();

      if (!apiResponse.ok) {
        // Si la API falla (ej: subdominio duplicado en Prisma), intentamos borrar al usuario en Supabase Auth
        // Nota: En un flujo de producción, esto se puede manejar con webhooks o limpieza diferida,
        // aquí mostramos la alerta de inmediato para que el usuario elija otro slug.
        throw new Error(apiResult.error || "Ocurrió un error al registrar el club.");
      }

      setSuccessMsg("¡Registro exitoso! Redireccionando al login...");
      
      // Redirigir al Login para iniciar sesión
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Luces de fondo difuminadas */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-900/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <h2 className="text-center text-4xl font-extrabold tracking-tight text-white">
          Registrar tu Club
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Crea tu cuenta de Clubify y autogenera tu sitio web hoy mismo
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-slate-900/80 backdrop-blur-md py-8 px-6 shadow-2xl border border-slate-800 rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleRegister}>
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

            {/* Fila: Datos del Club */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-200">
                  Nombre del Club
                </label>
                <input
                  type="text"
                  required
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-800 rounded-lg bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                  placeholder="Club Atlético San Martín"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200">
                  Subdominio Deseado
                </label>
                <div className="mt-1 flex rounded-lg shadow-sm">
                  <input
                    type="text"
                    required
                    value={clubSlug}
                    onChange={(e) => setClubSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                    className="flex-1 appearance-none block w-full px-3 py-2 border border-slate-800 rounded-l-lg bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                    placeholder="san-martin"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-slate-800 bg-slate-800 text-slate-400 text-sm">
                    .clubify.app
                  </span>
                </div>
              </div>
            </div>

            {/* Fila: Nombre del Administrador */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-200">
                  Nombre del Administrador
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-800 rounded-lg bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                  placeholder="Juan"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200">
                  Apellido del Administrador
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-800 rounded-lg bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                  placeholder="Pérez"
                />
              </div>
            </div>

            {/* Fila: Email y Contraseña */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-200">
                  Email de Gestión
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-800 rounded-lg bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                  placeholder="juan.perez@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200">
                  Contraseña de Acceso
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 appearance-none block w-full px-3 py-2 border border-slate-800 rounded-lg bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent sm:text-sm transition-all"
                  placeholder="•••••••• (Mín. 6 caracteres)"
                />
              </div>
            </div>

            {/* Botón de Registro */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Creando cuenta y base de datos..." : "Registrar Club"}
              </button>
            </div>
          </form>

          {/* Enlace de Login */}
          <div className="mt-6 text-center">
            <span className="text-sm text-slate-400">
              ¿Ya registraste tu club?{" "}
              <a href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                Inicia sesión aquí
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
