"use client";

import React, { useState } from "react";
import { Calendar, Clock, MapPin, Share2 } from "lucide-react";

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

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Selector de Filtros (Estilo Deportivo) */}
      <div className="flex gap-1.5 bg-slate-950 border border-slate-850 p-1 rounded-xl shadow-lg">
        {[
          { name: "Todos", status: "ALL" },
          { name: "Próximos", status: "SCHEDULED" },
          { name: "Resultados", status: "FINISHED" },
        ].map((tab) => {
          const isActive = filter === tab.status;
          return (
            <button
              key={tab.status}
              onClick={() => setFilter(tab.status as any)}
              className={`flex-1 py-2 text-[10px] font-black rounded-lg uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-md border border-slate-800"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Listado de Partidos */}
      {filteredMatches.length === 0 ? (
        <div className="p-10 bg-slate-900/40 border border-slate-850 rounded-2xl text-center text-slate-500 text-xs shadow-sm">
          No hay encuentros registrados en este filtro.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((match) => {
            const isFinished = match.status === "FINISHED";
            
            return (
              <div 
                key={match.id} 
                className="p-5 bg-slate-900/60 backdrop-blur border border-slate-850 rounded-3xl flex flex-col justify-between gap-4 hover:shadow-2xl hover:shadow-[var(--primary-club)]/15 hover:border-[var(--primary-club)]/40 transition-all duration-350 shadow-xl"
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-850 pb-2">
                    <span className="font-black uppercase tracking-wider text-[var(--primary-club)]">
                      {match.category.discipline.name} - {match.category.name}
                    </span>
                    <span className="flex items-center font-bold text-slate-350">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-[var(--primary-club)]" />
                      {new Date(match.matchDate).toLocaleDateString("es-AR")}
                    </span>
                  </div>

                  {/* Marcador Central */}
                  <div className="flex justify-between items-center text-sm font-black text-white py-1">
                    <span className={`w-[40%] truncate ${match.homeTeam.isOwnClub ? "text-[var(--primary-club)]" : "text-slate-300"}`}>
                      {match.homeTeam.name}
                    </span>
                    
                    <div className="w-[20%] flex justify-center shrink-0">
                      {isFinished ? (
                        <span className="bg-slate-950 text-white border border-slate-850 font-extrabold px-3 py-1 rounded-xl text-xs shadow-inner">
                          {match.homeScore} - {match.awayScore}
                        </span>
                      ) : (
                        <span className="text-[9px] bg-slate-950 text-slate-400 font-extrabold px-2.5 py-1 rounded-full uppercase border border-slate-850">
                          vs
                        </span>
                      )}
                    </div>
                    
                    <span className={`w-[40%] text-right truncate ${match.awayTeam.isOwnClub ? "text-[var(--primary-club)]" : "text-slate-300"}`}>
                      {match.awayTeam.name}
                    </span>
                  </div>

                  {/* Detalles adicionales */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1.5 border-t border-slate-850">
                    {match.matchTime && (
                      <div className="text-[10px] text-slate-400 font-bold flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 text-[var(--primary-club)]" />
                        {new Date(match.matchTime).toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} hs
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 font-bold flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-[var(--primary-club)]" />
                      {match.facility ? match.facility.name : (match.customLocationName || "Cancha rival")}
                    </div>
                  </div>
                </div>

                {/* Botón de Compartir */}
                <div className="border-t border-slate-850 pt-3 flex justify-end">
                  <button
                    onClick={() => handleShare(match)}
                    className="inline-flex items-center text-[10px] font-black text-slate-300 hover:text-white bg-slate-950 hover:bg-[var(--primary-club)] border border-slate-850 hover:border-transparent px-4 py-2 rounded-full transition-all duration-200 cursor-pointer uppercase tracking-wider"
                  >
                    <Share2 className="h-3.5 w-3.5 mr-1 text-slate-400 group-hover:text-white" />
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
