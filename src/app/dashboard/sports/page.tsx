"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Dribbble,
  Users2,
  Calendar,
  Shield,
  Activity,
  PlusCircle,
  Award,
  ChevronRight,
  TrendingUp,
  MapPin,
  Clock,
  Edit2,
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

  // Estados del Módulo Equipos y Partidos
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  
  const [showNewTeamModal, setShowNewTeamModal] = useState(false);
  const [newTeamForm, setNewTeamForm] = useState({
    name: "",
    shortName: "",
    logoColorUrl: "",
    isOwnClub: false,
  });

  const [showNewMatchModal, setShowNewMatchModal] = useState(false);
  const [newMatchForm, setNewMatchForm] = useState({
    categoryId: "",
    homeTeamId: "",
    awayTeamId: "",
    matchDate: "",
    matchTime: "",
    facilityId: "",
    customLocationName: "",
    customLocationAddress: "",
  });

  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [matchSummary, setMatchSummary] = useState("");

  // Cargar datos consolidados
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

        // 1. Cargar Disciplinas
        const dispRes = await fetch(`/api/sports?clubId=${activeClub.id}`);
        const dispResult = await dispRes.json();
        if (dispRes.ok && dispResult.success) {
          setDisciplines(dispResult.data);
        }

        // 2. Cargar Personas
        const peopRes = await fetch(`/api/people?clubId=${activeClub.id}`);
        const peopResult = await peopRes.json();
        if (peopRes.ok && peopResult.success) {
          setPeople(peopResult.data);
        }

        // 3. Cargar Equipos
        const teamRes = await fetch(`/api/teams?clubId=${activeClub.id}`);
        const teamResult = await teamRes.json();
        if (teamRes.ok && teamResult.success) {
          setTeams(teamResult.data);
        }

        // 4. Cargar Partidos
        const matchRes = await fetch(`/api/matches?clubId=${activeClub.id}`);
        const matchResult = await matchRes.json();
        if (matchRes.ok && matchResult.success) {
          setMatches(matchResult.data);
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
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setShowNewSportModal(false);
        setNewSportName("");
        setNewSportDesc("");
        fetchData();
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
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setShowNewCatModal(false);
        setNewCatName("");
        setNewCatAge("");
        fetchData();
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
      alert("Faltan campos obligatorios.");
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

  // Crear Equipo
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamForm.name) return;

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId: club.id,
          name: newTeamForm.name,
          shortName: newTeamForm.shortName,
          isOwnClub: newTeamForm.isOwnClub,
          logoColorUrl: newTeamForm.logoColorUrl,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setShowNewTeamModal(false);
        setNewTeamForm({ name: "", shortName: "", logoColorUrl: "", isOwnClub: false });
        fetchData();
      } else {
        alert(result.error || "Error al crear equipo");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Programar Partido
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    const { categoryId, homeTeamId, awayTeamId, matchDate, matchTime } = newMatchForm;

    if (!categoryId || !homeTeamId || !awayTeamId || !matchDate) {
      alert("Por favor, completa los campos requeridos.");
      return;
    }

    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clubId: club.id,
          ...newMatchForm,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setShowNewMatchModal(false);
        setNewMatchForm({
          categoryId: "",
          homeTeamId: "",
          awayTeamId: "",
          matchDate: "",
          matchTime: "",
          facilityId: "",
          customLocationName: "",
          customLocationAddress: "",
        });
        fetchData();
      } else {
        alert(result.error || "Error al programar partido");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cargar Resultado
  const handleUpdateScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatch) return;

    try {
      const res = await fetch("/api/matches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedMatch.id,
          homeScore: homeScore === "" ? null : homeScore,
          awayScore: awayScore === "" ? null : awayScore,
          status: "FINISHED",
          matchSummary,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setShowScoreModal(false);
        setSelectedMatch(null);
        setHomeScore("");
        setAwayScore("");
        setMatchSummary("");
        fetchData();
      } else {
        alert(result.error || "Error al registrar marcador");
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

  // Agrupar categorías de todos los deportes para cargarlas en selectores
  const allCategories = disciplines.flatMap((d) =>
    d.categories.map((c: any) => ({ ...c, disciplineName: d.name }))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera del Módulo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Gestión Deportiva</h1>
          <p className="text-sm text-slate-400">
            Administra deportes, categorías, planteles y la agenda de partidos.
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
          {activeTab === "matches" && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewTeamModal(true)}
                className="flex items-center px-4 py-2 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Equipo
              </button>
              <button
                onClick={() => setShowNewMatchModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Programar Partido
              </button>
            </div>
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

      {/* ======================= VISTA 3: PARTIDOS Y FIXTURE (COMPLETO) ======================= */}
      {activeTab === "matches" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            {matches.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Calendar className="h-12 w-12 mx-auto text-slate-700 mb-3" />
                <p className="text-sm font-bold">No hay partidos cargados en la agenda.</p>
                <p className="text-xs mt-1">Crea equipos y agenda un nuevo partido para comenzar.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="p-4">Partido</th>
                    <th className="p-4">Deporte y Categoría</th>
                    <th className="p-4">Fecha y Hora</th>
                    <th className="p-4">Lugar</th>
                    <th className="p-4 text-center">Marcador</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {matches.map((match) => (
                    <tr key={match.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-bold text-white">
                        <span className="flex items-center gap-2">
                          <span className={match.homeTeam.isOwnClub ? "text-blue-400" : ""}>
                            {match.homeTeam.name}
                          </span>
                          <span className="text-slate-500 font-normal text-xs">vs</span>
                          <span className={match.awayTeam.isOwnClub ? "text-blue-400" : ""}>
                            {match.awayTeam.name}
                          </span>
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {match.category.discipline.name} - <span className="text-white font-semibold">{match.category.name}</span>
                      </td>
                      <td className="p-4 text-slate-400">
                        <span className="block">{new Date(match.matchDate).toLocaleDateString("es-AR")}</span>
                        {match.matchTime && (
                          <span className="text-xs text-slate-500 flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(match.matchTime).toLocaleTimeString("es-AR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })} hs
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 text-xs">
                        {match.facility ? (
                          <span className="flex items-center text-emerald-400 font-medium">
                            <MapPin className="h-3 w-3 mr-1" />
                            {match.facility.name} (Local)
                          </span>
                        ) : (
                          <span className="flex items-center text-amber-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            {match.customLocationName || "Por definir"}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {match.status === "FINISHED" ? (
                          <span className="text-base font-black text-white bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                            {match.homeScore} - {match.awayScore}
                          </span>
                        ) : (
                          <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-900 px-2 py-0.5 rounded font-bold uppercase">
                            Programado
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {match.status !== "FINISHED" && (
                          <button
                            onClick={() => {
                              setSelectedMatch(match);
                              setHomeScore("");
                              setAwayScore("");
                              setShowScoreModal(true);
                            }}
                            className="text-xs bg-blue-900/40 text-blue-400 border border-blue-800/50 px-3 py-1 rounded hover:bg-blue-600 hover:text-white transition-colors flex items-center ml-auto"
                          >
                            <Edit2 className="h-3 w-3 mr-1.5" />
                            Cargar Score
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ======================= MODAL: REGISTRAR EQUIPO ======================= */}
      {showNewTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-850 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-white mb-4">Registrar Nuevo Equipo</h3>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nombre del Equipo</label>
                <input
                  type="text"
                  required
                  value={newTeamForm.name}
                  onChange={(e) => setNewTeamForm({ ...newTeamForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                  placeholder="Club Deportivo Rival, Clubify FC..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nombre Corto</label>
                  <input
                    type="text"
                    value={newTeamForm.shortName}
                    onChange={(e) => setNewTeamForm({ ...newTeamForm, shortName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                    placeholder="CDR"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">¿Es de nuestro Club?</label>
                  <select
                    value={newTeamForm.isOwnClub ? "true" : "false"}
                    onChange={(e) => setNewTeamForm({ ...newTeamForm, isOwnClub: e.target.value === "true" })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                  >
                    <option value="false">Rival / Externo</option>
                    <option value="true">Equipo del Club</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTeamModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-lg transition-colors"
                >
                  Guardar Equipo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: PROGRAMAR PARTIDO ======================= */}
      {showNewMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-850 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-white mb-4">Programar Partido</h3>
            <form onSubmit={handleCreateMatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Categoría del Club</label>
                <select
                  required
                  value={newMatchForm.categoryId}
                  onChange={(e) => setNewMatchForm({ ...newMatchForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                >
                  <option value="">Seleccionar Categoría...</option>
                  {allCategories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.disciplineName} - {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Equipo Local</label>
                  <select
                    required
                    value={newMatchForm.homeTeamId}
                    onChange={(e) => setNewMatchForm({ ...newMatchForm, homeTeamId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                  >
                    <option value="">Seleccionar Local...</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} {team.isOwnClub ? "(Nosotros)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Equipo Visitante</label>
                  <select
                    required
                    value={newMatchForm.awayTeamId}
                    onChange={(e) => setNewMatchForm({ ...newMatchForm, awayTeamId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                  >
                    <option value="">Seleccionar Visitante...</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} {team.isOwnClub ? "(Nosotros)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Fecha del Partido</label>
                  <input
                    type="date"
                    required
                    value={newMatchForm.matchDate}
                    onChange={(e) => setNewMatchForm({ ...newMatchForm, matchDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Hora del Partido</label>
                  <input
                    type="time"
                    value={newMatchForm.matchTime}
                    onChange={(e) => setNewMatchForm({ ...newMatchForm, matchTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ubicación del Partido</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Cancha / Estadio Rival</label>
                    <input
                      type="text"
                      value={newMatchForm.customLocationName}
                      onChange={(e) => setNewMatchForm({ ...newMatchForm, customLocationName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                      placeholder="Estadio Principal, Cancha Auxiliar..."
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Dirección del Estadio</label>
                    <input
                      type="text"
                      value={newMatchForm.customLocationAddress}
                      onChange={(e) => setNewMatchForm({ ...newMatchForm, customLocationAddress: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                      placeholder="Calle Falsa 123, Rosario..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setShowNewMatchModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-lg transition-colors"
                >
                  Programar Partido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: CARGAR RESULTADO (SCORE) ======================= */}
      {showScoreModal && selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-850 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-white mb-4 text-center">Registrar Marcador</h3>
            
            <form onSubmit={handleUpdateScore} className="space-y-4">
              <div className="text-center font-bold text-white text-sm mb-4">
                {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-center text-xs font-semibold text-slate-400 uppercase mb-1">
                    Goles {selectedMatch.homeTeam.name}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white text-center rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-center text-xs font-semibold text-slate-400 uppercase mb-1">
                    Goles {selectedMatch.awayTeam.name}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white text-center rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Resumen del Partido (Opcional)</label>
                <textarea
                  value={matchSummary}
                  onChange={(e) => setMatchSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 h-24 resize-none"
                  placeholder="Escribe una crónica o comentario corto del encuentro..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowScoreModal(false);
                    setSelectedMatch(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-lg transition-colors"
                >
                  Finalizar Partido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
