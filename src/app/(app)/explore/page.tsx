"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { http } from "@/lib/http-client";

interface SearchResult {
  id: string;
  fullName: string;
  slug: string;
  photoPath: string | null;
  niche: string | null;
}

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounce search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        const data = await http<SearchResult[]>(`/users/search?q=${encodeURIComponent(query.trim())}`);
        setResults(data || []);
      } catch (error) {
        console.error("Error searching creators:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="min-h-screen bg-surface p-6 lg:p-10 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-headline font-black tracking-tighter text-on-surface mb-4">
            Explora Creadores
          </h1>
          <p className="text-on-surface-variant font-medium max-w-lg mx-auto">
            Encuentra a tus creadores favoritos y apoya su trabajo adquiriendo sus packs exclusivos.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-12 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors">
              search
            </span>
          </div>
          <input
            type="text"
            className="w-full bg-surface-container-high border-2 border-transparent focus:border-primary/30 rounded-2xl pl-12 pr-4 py-4 text-lg text-on-surface placeholder:text-outline focus:ring-4 focus:ring-primary/10 focus:bg-surface-container-lowest transition-all duration-300 outline-none shadow-sm"
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

        {/* Results */}
        <div>
          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {results.map((creator) => (
                <Link key={creator.id} href={`/${creator.slug}`} className="block group">
                  <div className="glass-panel rounded-3xl p-6 border border-outline-variant/10 text-center hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="w-24 h-24 mx-auto bg-primary-container/20 rounded-full mb-4 flex items-center justify-center text-primary text-3xl font-black uppercase ring-4 ring-primary/5 group-hover:ring-primary/20 transition-all overflow-hidden">
                      {creator.photoPath ? (
                        <img src={creator.photoPath} alt={creator.fullName} className="w-full h-full object-cover" />
                      ) : (
                        creator.fullName.charAt(0)
                      )}
                    </div>
                    <h3 className="text-xl font-headline font-bold text-on-surface truncate">{creator.fullName}</h3>
                    <p className="text-sm font-medium text-primary uppercase tracking-widest mt-1 mb-3">
                      @{creator.slug}
                    </p>
                    {creator.niche && (
                      <span className="inline-block bg-surface-container-highest text-on-surface-variant text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {creator.niche}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : hasSearched && !loading ? (
            <div className="text-center py-20 bg-surface-container-lowest rounded-3xl border border-dashed border-outline-variant/30">
              <span className="material-symbols-outlined text-6xl text-outline mb-4">search_off</span>
              <h3 className="text-xl font-headline font-bold text-on-surface mb-2">No se encontraron creadores</h3>
              <p className="text-on-surface-variant">Intenta buscar con otros términos o verifica la ortografía.</p>
            </div>
          ) : !hasSearched ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50 pointer-events-none grayscale">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="aspect-square bg-surface-container-highest rounded-3xl animate-pulse"></div>
               ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
