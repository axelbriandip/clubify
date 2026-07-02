"use client";

import React, { useState } from "react";
import { Landmark, Calendar, Shield, Users, CheckCircle2, Award, Quote, ChevronLeft, ChevronRight } from "lucide-react";

interface SubMilestone {
  title: string;
  description: string;
  imageUrl?: string;
}

interface Milestone {
  year: string;
  title: string;
  description: string;
  imageUrl?: string;
  subMilestones?: SubMilestone[];
}

interface HistorySliderProps {
  club: any;
  milestones: Milestone[];
  symbols: any[];
  values: any[];
}

export default function HistoryTimelineSlider({ club, milestones, symbols, values }: HistorySliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const settings = club.settings;
  const primaryColor = settings?.primaryColor || "#0284c7";
  const secondaryColor = settings?.secondaryColor || "#0f172a";

  const showTimeline = settings?.showHistoryTimeline !== false;
  const showSymbols = settings?.showHistorySymbols !== false;
  const showValues = settings?.showHistoryValues !== false;
  const showQuote = settings?.showHistoryQuote !== false;

  const currentMilestone = milestones[activeIndex];
  const hasPhoto = currentMilestone && !!currentMilestone.imageUrl;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : milestones.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < milestones.length - 1 ? prev + 1 : 0));
  };

  return (
    <div 
      className="space-y-20 selection:bg-[var(--primary-club)] selection:text-white"
      style={{
        "--primary-club": primaryColor,
        "--secondary-club": secondaryColor,
      } as React.CSSProperties}
    >
      {/* ================= SECCIÓN: ORÍGENES E IDENTIDAD ================= */}
      <section className="space-y-12">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-12 bg-[var(--primary-club)] rounded-full"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-club)]">Raíces de la Institución</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-outfit font-black uppercase tracking-tight text-slate-950 leading-none">
            Orígenes e Identidad
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-base text-slate-600 font-semibold leading-relaxed">
            <p>
              Fundado con la convicción de crear un espacio de pertenencia para las familias de nuestra ciudad, el club ha sido durante décadas un faro de desarrollo humano y deportivo. A través de la constancia, el juego limpio y el esfuerzo colectivo, formamos personas con valores sólidos y competidores apasionados en cada disciplina.
            </p>
            <p className="text-slate-500 font-medium text-sm">
              Nuestra divisa aurinegra representa la templanza del carbón y la luz del sol, un lema de trabajo duro y optimismo que llevamos en cada camiseta. Con el correr de los años, lo que inició como un club social barrial se ha transformado en un polo deportivo de referencia nacional.
            </p>
          </div>
        </div>
      </section>

      {/* ================= SECCIÓN: LÍNEA DE TIEMPO HORIZONTAL (CAROUSEL SLIDER) ================= */}
      {showTimeline && (
        <section className="space-y-10 pt-4 border-t border-slate-100">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Cronología</span>
              <h2 className="font-outfit font-black text-3xl md:text-4xl text-slate-950 uppercase tracking-tight">
                Grandes Eras e Hitos
              </h2>
            </div>
            
            {/* Controles del Slider */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrev}
                className="h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-[var(--primary-club)] hover:border-[var(--primary-club)] transition-colors shadow-sm"
                aria-label="Hito anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-xs font-bold text-slate-400">
                {activeIndex + 1} / {milestones.length}
              </span>
              <button 
                onClick={handleNext}
                className="h-10 w-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-[var(--primary-club)] hover:border-[var(--primary-club)] transition-colors shadow-sm"
                aria-label="Siguiente hito"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navegador de Años Horizontal (Barra de Progreso) */}
          <div className="relative pt-6 pb-2">
            <div className="absolute top-[37px] left-0 right-0 h-0.5 bg-slate-100"></div>
            <div 
              className="absolute top-[37px] left-0 h-0.5 bg-[var(--primary-club)] transition-all duration-500"
              style={{ width: `${(activeIndex / (milestones.length - 1)) * 100}%` }}
            ></div>
            
            <div className="relative flex justify-between items-center max-w-4xl mx-auto">
              {milestones.map((item, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className="flex flex-col items-center gap-2 group focus:outline-none z-10"
                  >
                    <span 
                      className={`h-5 w-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center bg-white ${
                        isActive 
                          ? "border-[var(--primary-club)] scale-120" 
                          : "border-slate-200 group-hover:border-slate-450"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full transition-all duration-300 ${
                        isActive ? "bg-[var(--primary-club)]" : "bg-transparent"
                      }`}></span>
                    </span>
                    <span className={`font-outfit font-black text-xs md:text-sm tracking-tight transition-all duration-300 ${
                      isActive 
                        ? "text-[var(--primary-club)] scale-110" 
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}>
                      {item.year}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ventana de Contenido Activo */}
          <div className="relative min-h-[400px] overflow-hidden">
            {milestones.map((item, idx) => {
              const isActive = idx === activeIndex;
              const hasPhoto = !!item.imageUrl;

              return (
                <div
                  key={idx}
                  className={`w-full transition-all duration-500 transform space-y-6 ${
                    isActive 
                      ? "opacity-100 translate-x-0 relative block" 
                      : "opacity-0 absolute pointer-events-none translate-x-10 hidden"
                  }`}
                >
                  {/* Título del Hito */}
                  <div className="flex items-baseline gap-3 border-b border-slate-100 pb-3">
                    <span className="font-outfit font-black text-4xl md:text-6xl text-[var(--primary-club)] select-none">
                      {item.year}
                    </span>
                    <h3 className="font-outfit font-black text-xl md:text-2xl text-slate-900 uppercase">
                      {item.title}
                    </h3>
                  </div>

                  {/* Bento Grid para el Hito Activo */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Texto descriptivo principal */}
                    <div className={`bg-slate-50 border border-slate-200/60 rounded-3xl p-8 flex flex-col justify-center ${hasPhoto ? "md:col-span-2" : "md:col-span-3"}`}>
                      <p className="text-sm md:text-base text-slate-700 font-semibold leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Foto Principal (Grayscale -> Color) */}
                    {hasPhoto && (
                      <div className="h-64 md:h-auto overflow-hidden rounded-3xl border border-slate-200 relative group cursor-pointer bg-slate-950">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-103 transition-all duration-750 ease-in-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-500"></div>
                      </div>
                    )}

                    {/* Sub-hitos integrados en la tarjeta del slider */}
                    {item.subMilestones && item.subMilestones.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-3 mt-4">
                        {item.subMilestones.map((sub, sIdx) => {
                          const hasSubPhoto = !!sub.imageUrl;
                          const isSubEven = sIdx % 2 === 0;

                          return (
                            <div 
                              key={sIdx}
                              className={`grid grid-cols-1 ${hasSubPhoto ? "md:grid-cols-2" : "md:grid-cols-1"} gap-6 md:col-span-3 border-t border-dashed border-slate-200 pt-6`}
                            >
                              <div className={`bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-center space-y-2 ${isSubEven ? "md:order-1" : "md:order-2"}`}>
                                <h4 className="font-outfit font-black text-xs text-slate-800 uppercase flex items-center gap-2">
                                  <span className="h-2 w-2 rounded-full bg-[var(--primary-club)] shrink-0"></span>
                                  {sub.title}
                                </h4>
                                <p className="text-xs text-slate-505 font-semibold leading-relaxed">
                                  {sub.description}
                                </p>
                              </div>

                              {hasSubPhoto && (
                                <div className={`h-48 overflow-hidden rounded-3xl border border-slate-200 relative group cursor-pointer bg-slate-950 ${isSubEven ? "md:order-2" : "md:order-1"}`}>
                                  <img 
                                    src={sub.imageUrl} 
                                    alt={sub.title} 
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-103 transition-all duration-750 ease-in-out"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-500"></div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================= SECCIÓN: PULL-QUOTE DINÁMICO DE PÁGINA COMPLETA ================= */}
      {showQuote && (
        <section className="bg-slate-950 text-white rounded-3xl p-10 md:p-16 my-16 relative overflow-hidden text-center shadow-xl">
          <div className="absolute inset-0 opacity-15 bg-[var(--primary-club)]"></div>
          <Quote className="h-14 w-14 text-[var(--primary-club)]/20 mx-auto mb-6" />
          <p className="font-outfit font-black text-xl md:text-3xl italic max-w-3xl mx-auto leading-normal z-10 relative">
            "La historia no es lo que dejamos atrás, sino los cimientos sólidos sobre los cuales seguimos construyendo el futuro de nuestra institución."
          </p>
          <div className="mt-6 z-10 relative space-y-1">
            <span className="block text-[9px] tracking-widest uppercase font-black text-[var(--primary-club)]">
              Orgullo e Identidad
            </span>
            <span className="text-[9px] text-slate-550 font-bold uppercase">
              {club.name.toUpperCase()} — DESDE 1910
            </span>
          </div>
        </section>
      )}

      {/* ================= SECCIÓN: SÍMBOLOS OFICIALES ================= */}
      {showSymbols && (
        <section className="space-y-12 pt-4 border-t border-slate-100">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identidad Visual</span>
            <h2 className="font-outfit font-black text-3xl text-slate-950 uppercase tracking-tight">
              Símbolos e Identidad
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {symbols.map((sym, idx) => (
              <div 
                key={idx}
                className="space-y-4 border-t-2 border-slate-150 pt-6 hover:border-[var(--primary-club)] transition-colors duration-300"
              >
                <span className="font-outfit font-black text-3xl text-[var(--primary-club)]/40 block">
                  0{idx + 1}
                </span>
                <h3 className="font-outfit font-black text-base text-slate-900 uppercase">
                  {sym.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  {sym.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= SECCIÓN: VALORES DEPORTIVOS ================= */}
      {showValues && (
        <section className="space-y-12 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <div className="p-2.5 rounded-2xl bg-[var(--primary-club)]/10 text-[var(--primary-club)] border border-[var(--primary-club)]/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-outfit font-black uppercase tracking-tight text-slate-900">
              Nuestros Valores Deportivos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, idx) => {
              const iconMap: { [key: string]: React.ComponentType<any> } = {
                users: Users,
                shield: Shield,
                award: Award,
              };
              const IconVal = iconMap[v.iconName] || Award;
              return (
                <div 
                  key={idx}
                  className="bg-slate-50 border border-slate-100 rounded-3xl p-8 hover:shadow-lg hover:bg-white hover:border-[var(--primary-club)]/20 transition-all duration-300 space-y-4"
                >
                  <div className="h-10 w-10 rounded-xl bg-[var(--primary-club)]/10 text-[var(--primary-club)] flex items-center justify-center border border-[var(--primary-club)]/15 shrink-0">
                    <IconVal className="h-5 w-5" />
                  </div>
                  <h3 className="font-outfit font-black text-lg text-slate-900 uppercase">
                    {v.title}
                  </h3>
                  <p className="text-xs text-slate-505 leading-relaxed font-semibold">
                    {v.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
