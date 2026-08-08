"use client";

import React, { useState, useEffect } from "react";
import { http } from "@/lib/http-client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface Category {
  id: string;
  name: string;
}

interface Media {
  id: string;
  title: string;
  url: string;
  type: string;
}

interface ContentPack {
  id: string;
  title: string;
  description: string;
  price: number;
  category: Category;
  media: Media[];
  createdAt: string;
}

export default function PacksPage() {
  const { toast } = useToast();
  const [packs, setPacks] = useState<ContentPack[]>([]);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    categoryId: "",
    mediaIds: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packsData, mediaData, catsData] = await Promise.all([
        http<ContentPack[]>("/packs/my-packs"),
        http<Media[]>("/media/my-content"),
        http<Category[]>("/packs/categories"),
      ]);
      setPacks(packsData);
      setMediaList(mediaData);
      setCategories(catsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMedia = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      mediaIds: prev.mediaIds.includes(id)
        ? prev.mediaIds.filter((mid) => mid !== id)
        : [...prev.mediaIds, id],
    }));
  };

  const handleCreatePack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.mediaIds.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "Debes seleccionar al menos un archivo." });
      return;
    }
    if (!formData.categoryId) {
      toast({ variant: "destructive", title: "Error", description: "Debes seleccionar una categoría." });
      return;
    }

    try {
      await http("/packs", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      toast({ title: "¡Éxito!", description: "El pack ha sido creado correctamente." });
      setIsCreating(false);
      setFormData({ title: "", description: "", price: 0, categoryId: "", mediaIds: [] });
      fetchData();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo crear el pack." });
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-screen-2xl mx-auto w-full space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Mis Packs</h1>
          <p className="text-on-surface-variant font-body mt-1">Organiza tu contenido en paquetes monetizables.</p>
        </div>
        {!isCreating && (
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-6 rounded-xl font-headline font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined mr-2">add_box</span>
            Crear Nuevo Pack
          </Button>
        )}
      </header>

      {isCreating ? (
        <div className="glass-panel p-8 rounded-3xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-headline font-bold">Configurar Nuevo Pack</h2>
            <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
          </div>

          <form onSubmit={handleCreatePack} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-on-surface-variant">Título del Pack</label>
                <input
                  required
                  className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Set de Verano 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-on-surface-variant">Descripción</label>
                <textarea
                  className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe qué encontrarán en este paquete..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-on-surface-variant">Precio (ARS)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-on-surface-variant">Categoría</label>
                  <select
                    required
                    className="w-full bg-surface-container-high border-none rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full py-6 text-lg">Guardar Pack y Publicar</Button>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold mb-2 uppercase tracking-wider text-on-surface-variant">Seleccionar Contenido ({formData.mediaIds.length})</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto p-2">
                {mediaList.map((m) => {
                  const isSelected = formData.mediaIds.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleToggleMedia(m.id)}
                      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        isSelected ? "border-primary ring-4 ring-primary/10 shadow-lg scale-95" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      {m.type === "video" ? (
                        <div className="w-full h-full bg-black flex items-center justify-center">
                          <span className="material-symbols-outlined text-white/50">play_circle</span>
                        </div>
                      ) : (
                        <img src={m.url} className="w-full h-full object-cover" alt="" />
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-md">
                          <span className="material-symbols-outlined text-xs">check</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packs.map((pack) => (
            <div key={pack.id} className="glass-panel rounded-3xl overflow-hidden border border-outline-variant/10 shadow-sm hover:shadow-xl transition-all group">
              <div className="aspect-video relative bg-surface-container-highest overflow-hidden">
                {pack.media[0]?.type === "video" ? (
                   <div className="w-full h-full bg-black/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-outline">movie</span>
                   </div>
                ) : (
                  <img src={pack.media[0]?.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                )}
                <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  {pack.category.name}
                </div>
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-xs">gallery_thumbnail</span>
                  {pack.media.length} archivos
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-headline font-bold text-on-surface">{pack.title}</h3>
                  <p className="text-on-surface-variant text-sm line-clamp-2 mt-1">{pack.description || "Sin descripción"}</p>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-outline uppercase tracking-tighter">Precio</span>
                      <span className="text-xl font-headline font-black text-primary">${pack.price}</span>
                   </div>
                   <div className="flex gap-2">
                     <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">edit</span>
                     </button>
                     <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-container-high text-on-surface-variant hover:text-error transition-colors">
                        <span className="material-symbols-outlined">delete</span>
                     </button>
                   </div>
                </div>
              </div>
            </div>
          ))}

          {packs.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center glass-panel rounded-3xl border-dashed border-2 border-outline-variant/10">
               <span className="material-symbols-outlined text-6xl text-outline mb-4">package_2</span>
               <h3 className="text-xl font-headline font-bold">No tienes packs creados</h3>
               <p className="text-on-surface-variant mt-2">Agrupa tu mejor contenido y comienza a vender acceso exclusivo.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
