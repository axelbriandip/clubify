"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  FileText,
  Trash2,
  Edit2,
  Calendar,
  CheckCircle,
  Eye,
  AlertCircle,
  EyeOff,
} from "lucide-react";

export default function MediaDashboard() {
  const [club, setClub] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del Formulario / Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
    imageUrl: "",
    category: "Institucional",
    isPublished: false,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const clubRes = await fetch(`/api/user/club?userId=${authUser.id}`);
      const clubResult = await clubRes.json();
      
      if (clubRes.ok && clubResult.success) {
        setClub(clubResult.club);

        const newsRes = await fetch(`/api/news?clubId=${clubResult.club.id}`);
        const newsResult = await newsRes.json();
        if (newsRes.ok && newsResult.success) {
          setNews(newsResult.data);
        }
      }
    } catch (err) {
      console.error("Error al cargar prensa:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.content) {
      alert("Por favor, completa los campos requeridos.");
      return;
    }

    try {
      const url = "/api/news";
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing 
        ? { id: editingId, ...form }
        : { clubId: club.id, ...form };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setShowModal(false);
        setForm({
          title: "",
          summary: "",
          content: "",
          imageUrl: "",
          category: "Institucional",
          isPublished: false,
        });
        setIsEditing(false);
        setEditingId(null);
        loadData();
      } else {
        alert(result.error || "Ocurrió un error al guardar el artículo.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (item: any) => {
    setIsEditing(true);
    setEditingId(item.id);
    setForm({
      title: item.title,
      summary: item.summary || "",
      content: item.content,
      imageUrl: item.imageUrl || "",
      category: item.category || "Institucional",
      isPublished: item.isPublished,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este artículo de prensa permanentemente?")) {
      return;
    }

    try {
      const res = await fetch(`/api/news?id=${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (res.ok && result.success) {
        loadData();
      } else {
        alert(result.error || "Error al eliminar la noticia.");
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
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera de Sección */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Prensa y Comunicados</h1>
          <p className="text-sm text-slate-400">
            Redacta comunicados oficiales, crónicas de partidos o anuncios institucionales para tu web.
          </p>
        </div>

        <button
          onClick={() => {
            setIsEditing(false);
            setForm({
              title: "",
              summary: "",
              content: "",
              imageUrl: "",
              category: "Institucional",
              isPublished: false,
            });
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Redactar Noticia
        </button>
      </div>

      {/* Listado de Noticias */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        {news.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="h-12 w-12 mx-auto text-slate-700 mb-3 animate-pulse" />
            <p className="text-sm font-bold">No hay artículos redactados aún.</p>
            <p className="text-xs mt-1">Comienza a redactar para mantener informada a tu comunidad.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="p-4">Artículo de Prensa</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Fecha Publicación</th>
                <th className="p-4 text-center">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {news.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 max-w-sm">
                    <div className="font-bold text-white truncate">{item.title}</div>
                    {item.summary && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">{item.summary}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-xs bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">
                    {item.publishedAt ? (
                      <span className="flex items-center text-xs">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-slate-500" />
                        {new Date(item.publishedAt).toLocaleDateString("es-AR")}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600 italic">No publicado</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {item.isPublished ? (
                      <span className="text-[10px] bg-emerald-950 border border-emerald-900 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase inline-flex items-center">
                        <Eye className="h-3 w-3 mr-1" /> Público
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-950 border border-amber-900 text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase inline-flex items-center">
                        <EyeOff className="h-3 w-3 mr-1" /> Borrador
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/20 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ======================= MODAL: REDACTAR / EDITAR NOTICIA ======================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-850 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {isEditing ? "Editar Artículo de Prensa" : "Redactar Nueva Noticia"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Título del Artículo</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                    placeholder="¡Histórico ascenso a Primera División!"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Categoría</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                  >
                    <option value="Institucional">Institucional</option>
                    <option value="Fútbol">Fútbol</option>
                    <option value="Básquet">Básquet</option>
                    <option value="Socios">Socios</option>
                    <option value="Infantiles">Infantiles</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Cope / Copete Resumen</label>
                <input
                  type="text"
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                  placeholder="Una síntesis corta que se mostrará en el listado principal de novedades..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">URL de Imagen Destacada</label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                  placeholder="https://imagenes.web.com/noticia1.jpg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Cuerpo de la Noticia</label>
                <textarea
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none h-48"
                  placeholder="Escribe la crónica, comunicado o texto principal aquí..."
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-850">
                <label className="flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded bg-slate-950 border-slate-800"
                  />
                  <span className="ml-2 text-sm font-semibold text-slate-200">Publicar Artículo (Público de inmediato)</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setIsEditing(false);
                      setEditingId(null);
                    }}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-lg transition-colors"
                  >
                    Guardar Noticia
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
