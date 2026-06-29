"use client";

import React, { useState } from "react";
import { Calendar, Clock, MapPin, Share2, Trophy } from "lucide-react";

interface MatchesListProps {
  initialMatches: any[];
  clubSlug: string;
  clubName: string;
}

export default function MatchesList({ initialMatches, clubSlug, clubName }: MatchesListProps) {
  const [filter, setFilter] = useState<"ALL" | "SCHEDULED" | "FINISHED">("ALL");

  // Filtrar los partidos localmente
  const filteredMatches = initialMatches.filter((match) => {
    if (filter === "ALL") return true;
    return match.status === filter;
  });

  const handleShare = (match: any) => {
    const isFinished = match.status === "FINISHED";
    const homeName = match.homeTeam.name;
    const awayName = match.awayTeam.name;
    const matchDate = new Date(match.matchDate).toLocaleDateString("es-AR");
    
    // Obtener la URL del club dinámicamente
    // En producción es clubSlug.clubify.app, en desarrollo usamos el host local
    const clubUrl = typeof window !== "undefined" 
      ? `${window.location.origin}`
      : `http://${clubSlug}.localhost:3000`;

    let message = "";
    
    if (isFinished) {
      message = `¡Resultado del partido de ${clubName}! 🏆\n\n⚽ ${homeName} ${match.homeScore} - ${match.awayScore} ${awayName}\n📅 Fecha: ${matchDate}\n\nMira la crónica completa del encuentro en: ${clubUrl}`;
    } else {
      const timeString = match.matchTime 
        ? ` a las ${new Date(match.matchTime).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} hs`
        : "";
      message = `¡Apoyemos a nuestro club! Próximo partido de ${clubName} 📅\n\n⚔️ ${homeName} vs ${awayName}\n🗓️ Día: ${matchDate}${timeString}\n📍 Lugar: ${match.facility ? match.facility.name : (match.customLocationName || "A definir")}\n\nSigue los detalles del encuentro en: ${clubUrl}`;
    }

    // Codificar mensaje para URL
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    
    // Abrir WhatsApp en pestaña nueva
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Selector de Filtros */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setFilter("ALL")}
          className={`flex-1 py-2 text-xs font-black rounded-lg uppercase tracking-wider transition-all ${
            filter === "ALL"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter("SCHEDULED")}
          className={`flex-1 py-2 text-xs font-black rounded-lg uppercase tracking-wider transition-all ${
            filter === "SCHEDULED"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Próximos
        </button>
        <button
          onClick={() => setFilter("FINISHED")}
          className={`flex-1 py-2 text-xs font-black rounded-lg uppercase tracking-wider transition-all ${
            filter === "FINISHED"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Resultados
        </button>
      </div>

      {/* Listado de Partidos */}
      {filteredMatches.length === 0 ? (
        <div className="p-8 bg-slate-50 border border-slate-100 rounded-xl text-center text-slate-400 text-xs">
          No hay encuentros registrados en este filtro.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((match) => {
            const isFinished = match.status === "FINISHED";
            
            return (
              <div 
                key={match.id} 
                className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between gap-4 hover:border-slate-200 transition-colors shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-200/50 pb-2">
                    <span className="font-bold text-[var(--primary-club)]">
                      {match.category.discipline.name} - {match.category.name}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(match.matchDate).toLocaleDateString("es-AR")}
                    </span>
                  </div>

                  {/* Rivales */}
                  <div className="flex justify-between items-center text-sm font-bold text-slate-900 py-1">
                    <span className={match.homeTeam.isOwnClub ? "text-[var(--primary-club)] font-black" : ""}>
                      {match.homeTeam.name}
                    </span>
                    {isFinished ? (
                      <span className="bg-slate-200 text-slate-900 px-2.5 py-1 rounded-lg text-xs font-black">
                        {match.homeScore} - {match.awayScore}
                      </span>
                    ) : (
                      <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded uppercase">
                        vs
                      </span>
                    )}
                    <span className={match.awayTeam.isOwnClub ? "text-[var(--primary-club)] font-black" : ""}>
                      {match.awayTeam.name}
                    </span>
                  </div>

                  {/* Detalles de hora y cancha */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                    {match.matchTime && (
                      <div className="text-[10px] text-slate-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(match.matchTime).toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} hs
                      </div>
                    )}
                    <div className="text-[10px] text-slate-500 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {match.facility ? match.facility.name : (match.customLocationName || "A definir")}
                    </div>
                  </div>
                </div>

                {/* Botón de Compartir */}
                <div className="border-t border-slate-200/60 pt-3 flex justify-end">
                  <button
                    onClick={() => handleShare(match)}
                    className="inline-flex items-center text-[10px] font-bold text-slate-600 hover:text-[var(--primary-club)] transition-colors"
                  >
                    <Share2 className="h-3.5 w-3.5 mr-1" />
                    Compartir WhatsApp
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
