"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Dribbble,
  Users2,
  Calendar,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Award,
  ChevronRight,
  Shield,
  Activity,
  PlusCircle,
} from "lucide-react";

export default function SportsDashboard() {
  const [club, setClub] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("people"); // tabs: disciplines, people, matches
  const [loading, setLoading] = useState(true);

  // Estados del Módulo Deportes (Disciplinas y Categorías)
  const [disciplines, setDisciplines] = useState<any[]>([]);
  const [showNewSportModal, setShowNewSportModal] = useState(false);
  const [newSportName, setNewSportName] = useState("");
  const [newSportDesc, setNewSportDesc] = useState("");
  
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [selectedSportId, setSelectedSportId] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatAge, setNewCatAge] = useState("");
  const [newCatGender, setNewCatGender] = useState("MIXED");

  // Estados del Módulo Personas y Planteles
  const [people, setPeople] = useState<any[]>([]);
  const [showNewPersonModal, setShowNewPersonModal] = useState(false);
  const [personForm, setPersonForm] = useState({
    firstName: "",
    lastName: "",
    nickname: "",
    dateOfBirth: "",
    placeOfBirth: "",
    nationality: "Argentino",
    email: "",
    phone: "",
    address: "",
    documentId: "",
    bloodType: "A+",
    medicalClearanceExpiry: "",
    memberNumber: "",
    isBoardMember: false,
    isStaffMember: false,
    isPlayer: false,
    boardPosition: "Vocal",
    staffRole: "Profesor",
    playerPreferredSide: "RIGHT",
    playerHeight: "",
    playerWeight: "",
    playerPrevClub: "",
    playerBio: "",
  });

  // Cargar datos
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const clubRes = await fetch(`/api/user/club?userId=${authUser.id}`);
      const clubResult = await clubRes.json();
      if (clubRes.ok && clubResult.success) {
        const activeClub = clubResult.club;
        setClub(activeClub);

        // Cargar Disciplinas
        const dispRes = await fetch(`/api/sports?clubId=${activeClub.id}`);
        const dispResult = await dispRes.json();
        if (dispRes.ok && dispResult.success) {
          setDisciplines(dispResult.data);
        }

        // Cargar Personas
        const peopRes = await fetch(`/api/people?clubId=${activeClub.id}`);
        const peopResult = await peopRes.json();
        if (peopRes.ok && peopResult.success) {
          setPeople(peopResult.data);
        }
      }
    } catch (err) {
      console.error("Error al cargar datos deportivos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Crear Deporte
  const handleCreateSport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSportName) return;

    try {
      const res = await fetch("/api/sports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId: club.id,
          name: newSportName,
          description: newSportDesc,
          sortOrder: 10,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setShowNewSportModal(false);
        setNewSportName("");
        setNewSportDesc("");
        fetchData(); // Recargar datos
      } else {
        alert(result.error || "Error al crear deporte");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Crear Categoría
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !selectedSportId) return;

    try {
      const res = await fetch("/api/sports/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disciplineId: selectedSportId,
          name: newCatName,
          ageRange: newCatAge,
          gender: newCatGender,
          sortOrder: 10,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setShowNewCatModal(false);
        setNewCatName("");
        setNewCatAge("");
        fetchData(); // Recargar datos
      } else {
        alert(result.error || "Error al crear categoría");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Crear Persona
  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personForm.firstName || !personForm.lastName || !personForm.dateOfBirth) {
      alert("Por favor, completa los campos obligatorios (Nombre, Apellido, Nacimiento).");
      return;
    }

    try {
      const payload = {
        clubId: club.id,
        firstName: personForm.firstName,
        lastName: personForm.lastName,
        nickname: personForm.nickname,
        dateOfBirth: personForm.dateOfBirth,
        placeOfBirth: personForm.placeOfBirth,
        nationality: personForm.nationality,
        email: personForm.email,
        phone: personForm.phone,
        address: personForm.address,
        documentId: personForm.documentId,
        bloodType: personForm.bloodType,
        medicalClearanceExpiry: personForm.medicalClearanceExpiry || null,
        memberNumber: personForm.memberNumber,
        isBoardMember: personForm.isBoardMember,
        isStaffMember: personForm.isStaffMember,
        isPlayer: personForm.isPlayer,
        boardData: personForm.isBoardMember ? { position: personForm.boardPosition } : null,
        staffData: personForm.isStaffMember ? { mainRole: personForm.staffRole } : null,
        playerData: personForm.isPlayer
          ? {
              preferredSide: personForm.playerPreferredSide,
              heightCm: personForm.playerHeight,
              weightKg: personForm.playerWeight,
              previousClub: personForm.playerPrevClub,
              bioDescription: personForm.playerBio,
            }
          : null,
      };

      const res = await fetch("/api/people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setShowNewPersonModal(false);
        // Reset del formulario
        setPersonForm({
          firstName: "",
          lastName: "",
          nickname: "",
          dateOfBirth: "",
          placeOfBirth: "",
          nationality: "Argentino",
          email: "",
          phone: "",
          address: "",
          documentId: "",
          bloodType: "A+",
          medicalClearanceExpiry: "",
          memberNumber: "",
          isBoardMember: false,
          isStaffMember: false,
          isPlayer: false,
          boardPosition: "Vocal",
          staffRole: "Profesor",
          playerPreferredSide: "RIGHT",
          playerHeight: "",
          playerWeight: "",
          playerPrevClub: "",
          playerBio: "",
        });
        fetchData();
      } else {
        alert(result.error || "Error al registrar persona");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !club) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Gestión Deportiva</h1>
          <p className="text-sm text-slate-400">
            Administra deportes, categorías, planteles y jugadores federados.
          </p>
        </div>

        {/* Botones de Acción contextuales */}
        <div className="flex gap-2">
          {activeTab === "disciplines" && (
            <button
              onClick={() => setShowNewSportModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Deporte
            </button>
          )}
          {activeTab === "people" && (
            <button
              onClick={() => setShowNewPersonModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Registrar Persona
            </button>
          )}
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="border-b border-slate-800 flex gap-4">
        <button
          onClick={() => setActiveTab("people")}
          className={`flex items-center pb-3 text-sm font-bold border-b-2 transition-colors px-1 ${
            activeTab === "people"
              ? "border-blue-600 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users2 className="h-4 w-4 mr-2" />
          Planteles y Personas
        </button>
        <button
          onClick={() => setActiveTab("disciplines")}
          className={`flex items-center pb-3 text-sm font-bold border-b-2 transition-colors px-1 ${
            activeTab === "disciplines"
              ? "border-blue-600 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Dribbble className="h-4 w-4 mr-2" />
          Deportes y Categorías
        </button>
        <button
          onClick={() => setActiveTab("matches")}
          className={`flex items-center pb-3 text-sm font-bold border-b-2 transition-colors px-1 ${
            activeTab === "matches"
              ? "border-blue-600 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Partidos y Fixture
        </button>
      </div>

      {/* ======================= VISTA 1: PLANTEL Y PERSONAS ======================= */}
      {activeTab === "people" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            {people.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Users2 className="h-12 w-12 mx-auto text-slate-700 mb-3" />
                <p className="text-sm font-bold">No hay personas registradas todavía.</p>
                <p className="text-xs mt-1">Registra directivos, profesores o jugadores para armar tus planteles.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="p-4">Apellido y Nombre</th>
                    <th className="p-4">DNI / Socio</th>
                    <th className="p-4">Roles Activos</th>
                    <th className="p-4">Apto Médico</th>
                    <th className="p-4 text-right">Ficha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {people.map((person) => {
                    const isMedicalExpired = person.medicalClearanceExpiry
                      ? new Date(person.medicalClearanceExpiry) < new Date()
                      : false;

                    return (
                      <tr key={person.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-bold text-white">
                          {person.lastName}, {person.firstName}
                          {person.nickname && <span className="text-xs text-slate-500 font-normal ml-1">("{person.nickname}")</span>}
                        </td>
                        <td className="p-4 text-slate-400">
                          <span className="block text-xs text-slate-500">DNI: {person.documentId || "No cargado"}</span>
                          {person.memberNumber && <span className="text-xs text-blue-400">Socio #{person.memberNumber}</span>}
                        </td>
                        <td className="p-4 flex gap-1.5 flex-wrap">
                          {person.boardMembers.length > 0 && (
                            <span className="text-[10px] bg-purple-950/60 border border-purple-900 text-purple-300 font-semibold px-2 py-0.5 rounded flex items-center">
                              <Shield className="h-3 w-3 mr-1" /> Directivo
                            </span>
                          )}
                          {person.staffMembers.length > 0 && (
                            <span className="text-[10px] bg-teal-950/60 border border-teal-900 text-teal-300 font-semibold px-2 py-0.5 rounded flex items-center">
                              <Activity className="h-3 w-3 mr-1" /> Staff
                            </span>
                          )}
                          {person.players.length > 0 && (
                            <span className="text-[10px] bg-blue-950/60 border border-blue-900 text-blue-300 font-semibold px-2 py-0.5 rounded flex items-center">
                              <Award className="h-3 w-3 mr-1" /> Jugador
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {person.medicalClearanceExpiry ? (
                            <span className={`text-xs font-semibold ${isMedicalExpired ? "text-red-400" : "text-emerald-400"}`}>
                              {new Date(person.medicalClearanceExpiry).toLocaleDateString("es-AR")}
                              {isMedicalExpired ? " (Vencido)" : ""}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-600">Sin registrar</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded hover:bg-slate-700 transition-colors">
                            Ver Detalle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ======================= VISTA 2: DEPORTES Y CATEGORIAS ======================= */}
      {activeTab === "disciplines" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {disciplines.length === 0 ? (
            <div className="col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center text-slate-500">
              <Dribbble className="h-12 w-12 mx-auto text-slate-700 mb-3 animate-pulse" />
              <p className="text-sm font-bold">No hay deportes configurados.</p>
              <p className="text-xs mt-1">Crea tu primer deporte (ej: Fútbol, Básquet) para organizar a las categorías.</p>
            </div>
          ) : (
            disciplines.map((sport) => (
              <div key={sport.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <Dribbble className="h-5 w-5 mr-2 text-blue-500" />
                        {sport.name}
                      </h3>
                      {sport.description && <p className="text-xs text-slate-400 mt-1">{sport.description}</p>}
                    </div>
                  </div>

                  {/* Listado de Categorías de esta disciplina */}
                  <div className="mt-4 space-y-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      Categorías Registradas
                    </span>
                    {sport.categories.length === 0 ? (
                      <p className="text-xs text-slate-600 italic">No hay categorías cargadas.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {sport.categories.map((cat: any) => (
                          <div key={cat.id} className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                            <span className="text-slate-300 font-bold">{cat.name}</span>
                            <span className="text-[10px] text-slate-500">{cat.ageRange || "General"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-850 mt-6 pt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedSportId(sport.id);
                      setShowNewCatModal(true);
                    }}
                    className="flex items-center text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <PlusCircle className="h-4 w-4 mr-1.5" />
                    Añadir Categoría
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ======================= VISTA 3: PARTIDOS Y FIXTURE (PREVIEW) ======================= */}
      {activeTab === "matches" && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center text-slate-500">
          <Calendar className="h-12 w-12 mx-auto text-slate-700 mb-3" />
          <p className="text-sm font-bold">Módulo de Fixture y Agenda Deportiva</p>
          <p className="text-xs mt-1 max-w-sm mx-auto">
            Este módulo se habilitará en el siguiente paso de la Fase 4 para permitir la carga y programación de partidos.
          </p>
        </div>
      )}

      {/* ======================= MODAL: NUEVO DEPORTE ======================= */}
      {showNewSportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-850 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-white mb-4">Agregar Nuevo Deporte</h3>
            <form onSubmit={handleCreateSport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={newSportName}
                  onChange={(e) => setNewSportName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Fútbol Femenino, Básquet, Rugby..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Descripción (Opcional)</label>
                <textarea
                  value={newSportDesc}
                  onChange={(e) => setNewSportDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 h-20 resize-none"
                  placeholder="Horarios generales, coordinadores..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewSportModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-lg transition-colors"
                >
                  Guardar Deporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: NUEVA CATEGORIA ======================= */}
      {showNewCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-855 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-white mb-4">Agregar Categoría</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Sub-17, Primera División, Cebollitas..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Rango de Edad</label>
                  <input
                    type="text"
                    value={newCatAge}
                    onChange={(e) => setNewCatAge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="15-17 años"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Rama / Género</label>
                  <select
                    value={newCatGender}
                    onChange={(e) => setNewCatGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Femenino</option>
                    <option value="MIXED">Mixto</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCatModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-lg transition-colors"
                >
                  Guardar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: REGISTRAR PERSONA Y ROLES ======================= */}
      {showNewPersonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-850 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Registrar Nueva Persona</h3>
            
            <form onSubmit={handleCreatePerson} className="space-y-6">
              {/* Sección 1: Datos Personales */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5">
                  1. Ficha Personal (Obligatorio)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={personForm.firstName}
                      onChange={(e) => setPersonForm({ ...personForm, firstName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Apellido</label>
                    <input
                      type="text"
                      required
                      value={personForm.lastName}
                      onChange={(e) => setPersonForm({ ...personForm, lastName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                      placeholder="Pérez"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      required
                      value={personForm.dateOfBirth}
                      onChange={(e) => setPersonForm({ ...personForm, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">DNI / Documento</label>
                    <input
                      type="text"
                      value={personForm.documentId}
                      onChange={(e) => setPersonForm({ ...personForm, documentId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                      placeholder="38.123.456"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Contacto e Interno */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5">
                  2. Contacto, Emergencia y Carnet
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      value={personForm.email}
                      onChange={(e) => setPersonForm({ ...personForm, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                      placeholder="juan.perez@gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Teléfono</label>
                    <input
                      type="text"
                      value={personForm.phone}
                      onChange={(e) => setPersonForm({ ...personForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                      placeholder="341-6123456"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Contacto de Emergencia</label>
                    <input
                      type="text"
                      value={personForm.emergencyContactName}
                      onChange={(e) => setPersonForm({ ...personForm, emergencyContactName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                      placeholder="María Pérez (Madre)"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Teléfono Emergencia</label>
                    <input
                      type="text"
                      value={personForm.emergencyContactPhone}
                      onChange={(e) => setPersonForm({ ...personForm, emergencyContactPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                      placeholder="341-6987654"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Vence Apto Médico</label>
                    <input
                      type="date"
                      value={personForm.medicalClearanceExpiry}
                      onChange={(e) => setPersonForm({ ...personForm, medicalClearanceExpiry: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Nro Socio (Opcional)</label>
                    <input
                      type="text"
                      value={personForm.memberNumber}
                      onChange={(e) => setPersonForm({ ...personForm, memberNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                      placeholder="S-1209"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Selección de Roles */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5">
                  3. Roles que cumple en el Club
                </h4>
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={personForm.isBoardMember}
                      onChange={(e) => setPersonForm({ ...personForm, isBoardMember: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded bg-slate-950 border-slate-800"
                    />
                    <span className="ml-2 text-sm font-semibold text-slate-200">Directivo</span>
                  </label>
                  <label className="flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={personForm.isStaffMember}
                      onChange={(e) => setPersonForm({ ...personForm, isStaffMember: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded bg-slate-950 border-slate-800"
                    />
                    <span className="ml-2 text-sm font-semibold text-slate-200">DT / Staff</span>
                  </label>
                  <label className="flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={personForm.isPlayer}
                      onChange={(e) => setPersonForm({ ...personForm, isPlayer: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded bg-slate-950 border-slate-800"
                    />
                    <span className="ml-2 text-sm font-semibold text-slate-200">Jugador</span>
                  </label>
                </div>

                {/* Campos Extra para Directivo */}
                {personForm.isBoardMember && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <h5 className="text-xs font-bold text-purple-400 uppercase">Configuración de Directivo</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cargo</label>
                        <input
                          type="text"
                          value={personForm.boardPosition}
                          onChange={(e) => setPersonForm({ ...personForm, boardPosition: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 text-white rounded text-xs focus:outline-none"
                          placeholder="Presidente, Tesorero, Vocal..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Campos Extra para Staff */}
                {personForm.isStaffMember && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                    <h5 className="text-xs font-bold text-teal-400 uppercase">Configuración de Staff/Entrenador</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rol Principal</label>
                        <input
                          type="text"
                          value={personForm.staffRole}
                          onChange={(e) => setPersonForm({ ...personForm, staffRole: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 text-white rounded text-xs focus:outline-none"
                          placeholder="Director Técnico, Preparador Físico..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Campos Extra para Jugador */}
                {personForm.isPlayer && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3 animate-slide-down">
                    <h5 className="text-xs font-bold text-blue-400 uppercase">Ficha Técnica de Jugador</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Perfil</label>
                        <select
                          value={personForm.playerPreferredSide}
                          onChange={(e) => setPersonForm({ ...personForm, playerPreferredSide: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 text-white rounded text-xs focus:outline-none"
                        >
                          <option value="RIGHT">Diestro (Derecha)</option>
                          <option value="LEFT">Zurdo (Izquierda)</option>
                          <option value="AMBIDEXTROUS">Ambidiestro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Altura (cm)</label>
                        <input
                          type="number"
                          value={personForm.playerHeight}
                          onChange={(e) => setPersonForm({ ...personForm, playerHeight: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 text-white rounded text-xs focus:outline-none"
                          placeholder="178"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Peso (kg)</label>
                        <input
                          type="text"
                          value={personForm.playerWeight}
                          onChange={(e) => setPersonForm({ ...personForm, playerWeight: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 text-white rounded text-xs focus:outline-none"
                          placeholder="74.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Procedencia</label>
                        <input
                          type="text"
                          value={personForm.playerPrevClub}
                          onChange={(e) => setPersonForm({ ...personForm, playerPrevClub: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 text-white rounded text-xs focus:outline-none"
                          placeholder="Club Libre"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Biografía / Datos Extra</label>
                      <textarea
                        value={personForm.playerBio}
                        onChange={(e) => setPersonForm({ ...personForm, playerBio: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 text-white rounded text-xs focus:outline-none h-16 resize-none"
                        placeholder="Descripción deportiva..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de Envío */}
              <div className="flex justify-end gap-2 border-t border-slate-850 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewPersonModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-lg transition-colors"
                >
                  Registrar Persona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
