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
      {/* Selector de Filtros Brutalista */}
      <div className="flex gap-1 bg-white border-2 border-slate-900 p-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
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
              className={`flex-1 py-2 text-[10px] font-bold uppercase font-oswald tracking-wider transition-all duration-150 cursor-pointer border ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-transparent hover:bg-slate-50"
              }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Listado de Partidos */}
      {filteredMatches.length === 0 ? (
        <div className="p-10 bg-slate-50 border-2 border-slate-900 border-dashed text-center text-slate-500 text-xs font-bold font-oswald uppercase tracking-wider">
          Sin encuentros registrados
        </div>
      ) : (
        <div className="space-y-5">
          {filteredMatches.map((match) => {
            const isFinished = match.status === "FINISHED";
            
            return (
              <div 
                key={match.id} 
                className="p-5 bg-white border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_var(--primary-club)] transition-all duration-150 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 border-b-2 border-slate-900 pb-2">
                    <span className="font-black uppercase font-oswald tracking-widest text-[var(--primary-club)]">
                      {match.category.discipline.name} - {match.category.name}
                    </span>
                    <span className="flex items-center font-bold font-oswald uppercase">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-slate-900" />
                      {new Date(match.matchDate).toLocaleDateString("es-AR")}
                    </span>
                  </div>

                  {/* Marcador Central */}
                  <div className="flex justify-between items-center text-sm font-black text-slate-900 py-1 font-oswald uppercase tracking-tight">
                    <span className={`w-[40%] truncate text-base ${match.homeTeam.isOwnClub ? "text-[var(--primary-club)]" : "text-slate-800"}`}>
                      {match.homeTeam.name}
                    </span>
                    
                    <div className="w-[20%] flex justify-center shrink-0">
                      {isFinished ? (
                        <span className="bg-slate-900 text-white font-extrabold px-3 py-1 text-xs border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono">
                          {match.homeScore} - {match.awayScore}
                        </span>
                      ) : (
                        <span className="text-[9px] bg-white text-slate-900 font-extrabold px-2.5 py-1 uppercase border-2 border-slate-900 tracking-wider">
                          vs
                        </span>
                      )}
                    </div>
                    
                    <span className={`w-[40%] text-right truncate text-base ${match.awayTeam.isOwnClub ? "text-[var(--primary-club)]" : "text-slate-800"}`}>
                      {match.awayTeam.name}
                    </span>
                  </div>

                  {/* Detalles adicionales */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1.5 border-t border-slate-100 text-[10px] text-slate-500 font-bold uppercase font-oswald">
                    {match.matchTime && (
                      <div className="flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 text-[var(--primary-club)]" />
                        {new Date(match.matchTime).toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} hs
                      </div>
                    )}
                    <div className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 mr-1 text-[var(--primary-club)]" />
                      {match.facility ? match.facility.name : (match.customLocationName || "Cancha rival")}
                    </div>
                  </div>
                </div>

                {/* Botón de Compartir */}
                <div className="border-t border-slate-100 pt-3 flex justify-end">
                  <button
                    onClick={() => handleShare(match)}
                    className="inline-flex items-center text-[10px] font-black uppercase font-oswald text-slate-900 bg-white hover:bg-slate-900 hover:text-white border-2 border-slate-900 px-3.5 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 cursor-pointer"
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
