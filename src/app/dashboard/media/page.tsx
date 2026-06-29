"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  FileText,
  Trash2,
  Edit2,
  Calendar,
  Eye,
  AlertCircle,
  EyeOff,
  Image,
  Image as ImageIcon,
  FolderHeart,
  Save,
  Trash,
} from "lucide-react";

export default function MediaDashboard() {
  const [club, setClub] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selector del Tab Principal
  const [activeTab, setActiveTab] = useState<"NEWS" | "ALBUMS">("NEWS");

  // Estados del Modal de Noticias
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [isEditingNews, setIsEditingNews] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState({
    title: "",
    summary: "",
    content: "",
    imageUrl: "",
    category: "Institucional",
    isPublished: false,
  });

  // Estados del Modal de Álbumes
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [isEditingAlbum, setIsEditingAlbum] = useState(false);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [albumForm, setAlbumForm] = useState({
    title: "",
    description: "",
    coverImageUrl: "",
  });
  const [albumPhotos, setAlbumPhotos] = useState<{ imageUrl: string; caption: string }[]>([
    { imageUrl: "", caption: "" }
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const clubRes = await fetch(`/api/user/club?userId=${authUser.id}`);
      const clubResult = await clubRes.json();
      
      if (clubRes.ok && clubResult.success) {
        const activeClub = clubResult.club;
        setClub(activeClub);

        // 1. Cargar Noticias
        const newsRes = await fetch(`/api/news?clubId=${activeClub.id}`);
        const newsResult = await newsRes.json();
        if (newsRes.ok && newsResult.success) {
          setNews(newsResult.data);
        }

        // 2. Cargar Álbumes
        const albumsRes = await fetch(`/api/albums?clubId=${activeClub.id}`);
        const albumsResult = await albumsRes.json();
        if (albumsRes.ok && albumsResult.success) {
          setAlbums(albumsResult.data);
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

  // Guardar Noticia
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.content) {
      alert("Por favor, completa los campos requeridos.");
      return;
    }

    try {
      const url = "/api/news";
      const method = isEditingNews ? "PUT" : "POST";
      const payload = isEditingNews 
        ? { id: editingNewsId, ...newsForm }
        : { clubId: club.id, ...newsForm };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setShowNewsModal(false);
        setNewsForm({
          title: "",
          summary: "",
          content: "",
          imageUrl: "",
          category: "Institucional",
          isPublished: false,
        });
        setIsEditingNews(false);
        setEditingNewsId(null);
        loadData();
      } else {
        alert(result.error || "Error al guardar el artículo.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditNewsClick = (item: any) => {
    setIsEditingNews(true);
    setEditingNewsId(item.id);
    setNewsForm({
      title: item.title,
      summary: item.summary || "",
      content: item.content,
      imageUrl: item.imageUrl || "",
      category: item.category || "Institucional",
      isPublished: item.isPublished,
    });
    setShowNewsModal(true);
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta noticia permanentemente?")) return;

    try {
      const res = await fetch(`/api/news?id=${id}`, { method: "DELETE" });
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

  // Guardar Álbum
  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumForm.title) {
      alert("Por favor, ingresa el título del álbum.");
      return;
    }

    // Filtrar fotos vacías
    const validPhotos = albumPhotos.filter(p => p.imageUrl.trim() !== "");

    try {
      const url = "/api/albums";
      const method = isEditingAlbum ? "PUT" : "POST";
      const payload = isEditingAlbum
        ? { id: editingAlbumId, ...albumForm, photos: validPhotos }
        : { clubId: club.id, ...albumForm, photos: validPhotos };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setShowAlbumModal(false);
        setAlbumForm({ title: "", description: "", coverImageUrl: "" });
        setAlbumPhotos([{ imageUrl: "", caption: "" }]);
        setIsEditingAlbum(false);
        setEditingAlbumId(null);
        loadData();
      } else {
        alert(result.error || "Error al guardar el álbum.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditAlbumClick = (item: any) => {
    setIsEditingAlbum(true);
    setEditingAlbumId(item.id);
    setAlbumForm({
      title: item.title,
      description: item.description || "",
      coverImageUrl: item.coverImageUrl || "",
    });
    setAlbumPhotos(item.photos.length > 0 
      ? item.photos.map((p: any) => ({ imageUrl: p.imageUrl, caption: p.caption || "" }))
      : [{ imageUrl: "", caption: "" }]
    );
    setShowAlbumModal(true);
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este álbum de fotos y todas sus imágenes asociadas?")) return;

    try {
      const res = await fetch(`/api/albums?id=${id}`, { method: "DELETE" });
      const result = await res.json();
      if (res.ok && result.success) {
        loadData();
      } else {
        alert(result.error || "Error al eliminar el álbum.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Manejar cambios en las filas de fotos del modal
  const handlePhotoRowChange = (index: number, field: "imageUrl" | "caption", value: string) => {
    const updated = [...albumPhotos];
    updated[index][field] = value;
    setAlbumPhotos(updated);
  };

  const addPhotoRow = () => {
    setAlbumPhotos([...albumPhotos, { imageUrl: "", caption: "" }]);
  };

  const removePhotoRow = (index: number) => {
    const updated = albumPhotos.filter((_, i) => i !== index);
    setAlbumPhotos(updated.length > 0 ? updated : [{ imageUrl: "", caption: "" }]);
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
      
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Prensa y Multimedia</h1>
          <p className="text-sm text-slate-400">
            Administra los comunicados institucionales y las galerías de fotos del club.
          </p>
        </div>

        {activeTab === "NEWS" ? (
          <button
            onClick={() => {
              setIsEditingNews(false);
              setNewsForm({ title: "", summary: "", content: "", imageUrl: "", category: "Institucional", isPublished: false });
              setShowNewsModal(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Redactar Noticia
          </button>
        ) : (
          <button
            onClick={() => {
              setIsEditingAlbum(false);
              setAlbumForm({ title: "", description: "", coverImageUrl: "" });
              setAlbumPhotos([{ imageUrl: "", caption: "" }]);
              setShowAlbumModal(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-md"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear Álbum de Fotos
          </button>
        )}
      </div>

      {/* Tabs Selector */}
      <div className="border-b border-slate-800 flex gap-4">
        <button
          onClick={() => setActiveTab("NEWS")}
          className={`flex items-center pb-3 text-sm font-bold border-b-2 transition-colors px-1 cursor-pointer ${
            activeTab === "NEWS" ? "border-blue-600 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-205"
          }`}
        >
          <FileText className="h-4 w-4 mr-2" />
          Artículos de Prensa
        </button>
        <button
          onClick={() => setActiveTab("ALBUMS")}
          className={`flex items-center pb-3 text-sm font-bold border-b-2 transition-colors px-1 cursor-pointer ${
            activeTab === "ALBUMS" ? "border-blue-600 text-blue-400" : "border-transparent text-slate-400 hover:text-slate-205"
          }`}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Galería de Fotos
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: ARTÍCULOS DE PRENSA */}
      {/* ========================================================================= */}
      {activeTab === "NEWS" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg animate-fade-in">
          {news.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <FileText className="h-12 w-12 mx-auto text-slate-700 mb-3" />
              <p className="text-sm font-bold">No hay artículos redactados aún.</p>
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
                      {item.summary && <p className="text-xs text-slate-500 truncate mt-0.5">{item.summary}</p>}
                    </td>
                    <td className="p-4">
                      <span className="text-xs bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {item.publishedAt ? (
                        <span className="flex items-center text-xs">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-slate-505" />
                          {new Date(item.publishedAt).toLocaleDateString("es-AR")}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600 italic">No publicado</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {item.isPublished ? (
                        <span className="text-[10px] bg-emerald-950 border border-emerald-900 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase inline-flex items-center">
                          Público
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-950 border border-amber-900 text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase inline-flex items-center">
                          Borrador
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditNewsClick(item)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNews(item.id)}
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
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: GALERÍA DE ÁLBUMES DE FOTOS */}
      {/* ========================================================================= */}
      {activeTab === "ALBUMS" && (
        <div className="animate-fade-in">
          {albums.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-550">
              <FolderHeart className="h-12 w-12 mx-auto text-slate-700 mb-3" />
              <p className="text-sm font-bold">No hay álbumes creados todavía.</p>
              <p className="text-xs mt-1">Crea álbumes para registrar fotos de tus partidos o de la vida social del club.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
                >
                  <div>
                    {/* Portada */}
                    <div 
                      className="h-44 bg-cover bg-center" 
                      style={{ backgroundImage: `url(${album.coverImageUrl || "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=800&auto=format&fit=crop&q=80"})` }}
                    ></div>
                    <div className="p-5 space-y-2">
                      <h3 className="text-lg font-bold text-white truncate">{album.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{album.description || "Sin descripción."}</p>
                      <span className="inline-block text-[10px] bg-slate-950 text-blue-400 border border-slate-800 px-2 py-0.5 rounded font-bold uppercase mt-2">
                        {album.photos?.length || 0} Fotos
                      </span>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-850 flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => handleEditAlbumClick(album)}
                      className="flex items-center text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded transition-all"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" /> Editar
                    </button>
                    <button
                      onClick={() => handleDeleteAlbum(album.id)}
                      className="flex items-center text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/20 px-3 py-1.5 rounded transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Borrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REDACTAR / EDITAR NOTICIA */}
      {/* ========================================================================= */}
      {showNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-850 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {isEditingNews ? "Editar Artículo de Prensa" : "Redactar Nueva Noticia"}
            </h3>

            <form onSubmit={handleSaveNews} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Título</label>
                  <input
                    type="text"
                    required
                    value={newsForm.title}
                    onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                    placeholder="¡Título de la noticia!"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Categoría</label>
                  <select
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-955 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                  >
                    <option value="Institucional">Institucional</option>
                    <option value="Fútbol">Fútbol</option>
                    <option value="Básquet">Básquet</option>
                    <option value="Socios">Socios</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Resumen Corto</label>
                <input
                  type="text"
                  value={newsForm.summary}
                  onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-955 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                  placeholder="Resumen del listado..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">URL Imagen Destacada</label>
                <input
                  type="text"
                  value={newsForm.imageUrl}
                  onChange={(e) => setNewsForm({ ...newsForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-955 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Contenido de la Noticia</label>
                <textarea
                  required
                  value={newsForm.content}
                  onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-955 border border-slate-800 text-white rounded-lg text-sm focus:outline-none h-40 resize-none"
                />
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-850">
                <label className="flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newsForm.isPublished}
                    onChange={(e) => setNewsForm({ ...newsForm, isPublished: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded bg-slate-950 border-slate-800"
                  />
                  <span className="ml-2 text-sm font-semibold text-slate-200">Publicar Artículo</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewsModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-202"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-lg"
                  >
                    Guardar Noticia
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREAR / EDITAR ÁLBUM DE FOTOS */}
      {/* ========================================================================= */}
      {showAlbumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-850 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {isEditingAlbum ? "Editar Álbum de Fotos" : "Crear Nuevo Álbum de Fotos"}
            </h3>

            <form onSubmit={handleSaveAlbum} className="space-y-6">
              
              {/* Bloque 1: Datos Básicos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Título del Álbum *</label>
                  <input
                    type="text"
                    required
                    value={albumForm.title}
                    onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                    placeholder="Inauguración de Parquet, Festejos de Campeones..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">URL de Imagen de Portada</label>
                  <input
                    type="text"
                    value={albumForm.coverImageUrl}
                    onChange={(e) => setAlbumForm({ ...albumForm, coverImageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                    placeholder="https://images.unsplash.com/... (Portada)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Descripción del Álbum</label>
                <input
                  type="text"
                  value={albumForm.description}
                  onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-955 border border-slate-800 text-white rounded-lg text-sm focus:outline-none"
                  placeholder="Fotos tomadas durante los festejos..."
                />
              </div>

              {/* Bloque 2: Carga de Fotos Dinámica */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cargar Imágenes</h4>
                  <button
                    type="button"
                    onClick={addPhotoRow}
                    className="flex items-center text-xs bg-slate-850 hover:bg-slate-800 text-slate-300 px-3 py-1 rounded border border-slate-800 transition-colors font-bold"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Añadir Fila
                  </button>
                </div>

                <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1">
                  {albumPhotos.map((photo, index) => (
                    <div key={index} className="flex gap-3 items-center bg-slate-950 p-3 rounded-xl border border-slate-850 relative">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">URL de la Imagen</label>
                          <input
                            type="text"
                            required
                            value={photo.imageUrl}
                            onChange={(e) => handlePhotoRowChange(index, "imageUrl", e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                            placeholder="https://servidor.com/foto1.jpg"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Pie de Foto (Comentario)</label>
                          <input
                            type="text"
                            value={photo.caption}
                            onChange={(e) => handlePhotoRowChange(index, "caption", e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 text-white rounded-lg text-xs focus:outline-none"
                            placeholder="Entrada del equipo a la cancha..."
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhotoRow(index)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-slate-900 shrink-0 mt-4 transition-colors"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones de Guardado */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => {
                    setShowAlbumModal(false);
                    setAlbumForm({ title: "", description: "", coverImageUrl: "" });
                    setAlbumPhotos([{ imageUrl: "", caption: "" }]);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-202"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-lg transition-colors flex items-center"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" /> Guardar Álbum
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
