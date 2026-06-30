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
      const timeObj = match.matchTime ? new Date(match.matchTime) : null;
      const timeFormatted = timeObj 
        ? `${timeObj.getHours().toString().padStart(2, "0")}:${timeObj.getMinutes().toString().padStart(2, "0")}`
        : "";
      const timeString = timeFormatted ? ` a las ${timeFormatted} hs` : "";
      message = `¡Apoyemos a nuestro club! Próximo partido de ${clubName} 📅\n\n⚔️ ${homeName} vs ${awayName}\n🗓️ Día: ${matchDate}${timeString}\n📍 Lugar: ${match.facility ? match.facility.name : (match.customLocationName || "A definir")}\n\nSigue los detalles del encuentro en: ${clubUrl}`;
    }

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Selector de Filtros (Sleek Rounded) */}
      <div className="flex gap-1.5 bg-slate-100 border border-slate-200/60 p-1.5 rounded-2xl shadow-sm">
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
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/20"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Listado de Partidos */}
      {filteredMatches.length === 0 ? (
        <div className="p-10 bg-white border border-slate-100 rounded-3xl text-center text-slate-400 text-xs font-semibold shadow-sm">
          No hay encuentros registrados en este filtro.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((match) => {
            const isFinished = match.status === "FINISHED";
            
            return (
              <div 
                key={match.id} 
                className="p-5 bg-white border border-slate-100 rounded-3xl flex flex-col justify-between gap-4 shadow-sm hover:shadow-xl hover:border-[var(--primary-club)]/20 transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-400 border-b border-slate-100/60 pb-2">
                    <span className="font-black uppercase tracking-wider text-[var(--primary-club)]">
                      {match.category.discipline.name} - {match.category.name}
                    </span>
                    <span className="flex items-center font-medium">
                      <Calendar className="h-4 w-4 mr-1 text-[var(--primary-club)]" />
                      {new Date(match.matchDate).toLocaleDateString("es-AR")}
                    </span>
                  </div>

                  {/* Marcador Central */}
                  <div className="flex justify-between items-center text-sm font-bold text-slate-900 py-1">
                    <span className={`w-[40%] truncate text-base ${match.homeTeam.isOwnClub ? "text-[var(--primary-club)] font-extrabold" : "text-slate-800"}`}>
                      {match.homeTeam.name}
                    </span>
                    
                    <div className="w-[20%] flex justify-center shrink-0">
                      {isFinished ? (
                        <span className="bg-slate-950 text-white font-extrabold px-3 py-1 rounded-xl text-xs shadow-inner">
                          {match.homeScore} - {match.awayScore}
                        </span>
                      ) : (
                        <span className="text-xs bg-slate-50 text-slate-500 font-extrabold px-2.5 py-1 rounded-xl border border-slate-100">
                          vs
                        </span>
                      )}
                    </div>
                    
                    <span className={`w-[40%] text-right truncate text-base ${match.awayTeam.isOwnClub ? "text-[var(--primary-club)] font-extrabold" : "text-slate-800"}`}>
                      {match.awayTeam.name}
                    </span>
                  </div>

                  {/* Detalles adicionales */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1.5 border-t border-slate-100 text-xs text-slate-400 font-medium">
                    {match.matchTime && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-[var(--primary-club)]" />
                        {(() => {
                          const timeObj = new Date(match.matchTime);
                          const hh = timeObj.getHours().toString().padStart(2, "0");
                          const mm = timeObj.getMinutes().toString().padStart(2, "0");
                          return `${hh}:${mm}`;
                        })()} hs
                      </div>
                    )}
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-[var(--primary-club)]" />
                      {match.facility ? match.facility.name : (match.customLocationName || "Cancha rival")}
                    </div>
                  </div>
                </div>

                {/* Botón de Compartir */}
                <div className="border-t border-slate-100/60 pt-3 flex justify-end">
                  <button
                    onClick={() => handleShare(match)}
                    className="inline-flex items-center text-xs font-bold text-slate-600 bg-slate-50 hover:bg-[var(--primary-club)]/10 hover:text-[var(--primary-club)] px-4 py-2 rounded-full border border-slate-200/60 hover:border-[var(--primary-club)]/20 transition-all duration-200 cursor-pointer"
                  >
                    <Share2 className="h-3.5 w-3.5 mr-1 text-slate-400 group-hover:text-inherit" />
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
