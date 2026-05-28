"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { http } from "@/lib/http-client";
import { PublicHeader } from "@/components/public-header";

interface SearchResult {
  id: string;
  fullName: string;
  slug: string;
  photoPath: string | null;
  niche: string | null;
  bio: string | null;
  gender?: string;
}

const CATEGORIES = [
  { id: "all", name: "Todos", icon: "apps" },
  { id: "photography", name: "Fotografía", icon: "photo_camera" },
  { id: "film", name: "Cine", icon: "movie" },
  { id: "digital-art", name: "Arte Digital", icon: "brush" },
  { id: "other", name: "Otros", icon: "more_horiz" },
];

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Unificación de la llamada al backend para obtener creadores
  const fetchCreators = async (searchQuery: string, category: string) => {
    setLoading(true);
    try {
      const qParam = searchQuery ? `q=${encodeURIComponent(searchQuery.trim())}` : "";
      const nParam = category && category !== "all" ? `niche=${category}` : "";
      const params = [qParam, nParam].filter(Boolean).join("&");
      const url = `/users/search${params ? `?${params}` : ""}`;
      
      const data = await http<SearchResult[]>(url);
      setResults(data || []);
    } catch (error) {
      console.error("Error fetching creators:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial y recarga al cambiar de categoría inmediatamente
  useEffect(() => {
    fetchCreators(query, activeCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  // Debounce para la barra de búsqueda (espera 400ms después de escribir)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCreators(query, activeCategory);
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  // Mapear nombres descriptivos para los nichos en la visualización
  const getNicheLabel = (niche: string | null, gender?: string) => {
    const prefix = gender === "creador" ? "Creador" : "Creadora";
    if (!niche) return `${prefix} Digital`;
    switch (niche) {
      case "photography": return "Fotografía";
      case "film": return "Cine / Video";
      case "digital-art": return "Arte Digital";
      case "other": return "Otros";
      default: return niche;
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      <PublicHeader />

      <div className="max-w-6xl mx-auto px-6 pt-32 lg:pt-36 space-y-12 animate-in fade-in duration-500">
        
        {/* Título & Introducción */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-headline font-black tracking-tight text-on-surface">
            Descubre <span className="text-primary bg-clip-text">Creadores</span> Increíbles
          </h1>
          <p className="text-on-surface-variant font-body max-w-xl mx-auto text-base md:text-lg leading-relaxed">
            Explora el Atelier Digital y apoya el talento local de la comunidad Pina de forma directa.
          </p>
        </div>

        {/* Categorías (Píldoras de Filtro) - Regla No-Line */}
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex items-center gap-2 rounded-full py-2.5 px-6 font-headline font-bold text-xs uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 shadow-sm active:scale-95 ${
                  isActive
                    ? "bg-gradient-to-br from-primary to-primary-container text-white shadow-md shadow-primary/10"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Buscador - Regla No-Line */}
        <div className="relative max-w-xl mx-auto group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors duration-300">
              search
            </span>
          </div>
          <input
            type="text"
            className="w-full bg-surface-container-high border-none rounded-2xl pl-12 pr-12 py-4 text-base text-on-surface placeholder:text-outline focus:bg-surface-container-lowest transition-all duration-300 outline-none shadow-sm"
            placeholder="Buscar por nombre o @usuario..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="pt-4">
          {loading && results.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-surface-container-high rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-24 bg-surface-container-low rounded-[2rem] shadow-inner max-w-md mx-auto space-y-4">
              <span className="material-symbols-outlined text-6xl text-outline animate-bounce">search_off</span>
              <h3 className="text-xl font-headline font-bold text-on-surface">No se hallaron creadores</h3>
              <p className="text-on-surface-variant text-sm px-6">
                No hay coincidencias para esta búsqueda o categoría por el momento. ¡Intenta con otro filtro!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {results.map((creator) => (
                <Link key={creator.id} href={`/${creator.slug}`} className="block group">
                  <div className="bg-surface-container-low rounded-[2rem] p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
                    {/* Background Soft Glow on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10 flex flex-col items-center flex-grow">
                      {/* Avatar Wrapper with Gradient Border (Regla No-Line) */}
                      <div className="w-24 h-24 rounded-full mb-5 flex items-center justify-center p-1 bg-gradient-to-br from-primary via-secondary to-tertiary shadow-md">
                        <div className="w-full h-full bg-surface-container-low rounded-full overflow-hidden flex items-center justify-center text-primary text-3xl font-black uppercase">
                          {creator.photoPath ? (
                            <img src={creator.photoPath} alt={creator.fullName} className="w-full h-full object-cover" />
                          ) : (
                            creator.fullName.charAt(0)
                          )}
                        </div>
                      </div>

                      {/* Nombre y Slug */}
                      <h3 className="text-xl font-headline font-extrabold text-on-surface group-hover:text-primary transition-colors duration-300 truncate max-w-full">
                        {creator.fullName}
                      </h3>
                      <p className="text-xs font-bold text-secondary uppercase tracking-wider mt-1 mb-3">
                        @{creator.slug}
                      </p>

                      {/* Niche Badge */}
                      <span className="inline-block bg-surface-container-highest text-on-surface-variant text-[10px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-widest mt-1">
                        {getNicheLabel(creator.niche, creator.gender)}
                      </span>

                      {/* Biografía Corta */}
                      <p className="text-xs text-on-surface-variant/80 mt-4 leading-relaxed line-clamp-2 max-w-xs">
                        {creator.bio || "Explorando la creatividad digital y compartiendo recursos artísticos exclusivos en Pina."}
                      </p>
                    </div>

                    {/* Botón de Acción sutil al final */}
                    <div className="relative z-10 pt-6 mt-6 flex justify-center">
                      <div className="inline-flex items-center gap-1 text-xs font-headline font-bold text-primary group-hover:translate-x-1 transition-transform duration-300">
                        <span>Ver Galería y Perfil</span>
                        <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
