"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { http } from "@/lib/http-client";

interface FeedPack {
  id: string;
  title: string;
  description: string | null;
  price: number;
  media: { id: string; url: string }[];
  creator: {
    fullName: string;
    slug: string;
    photoPath: string | null;
  };
  createdAt: string;
}

export default function FeedPage() {
  const [packs, setPacks] = useState<FeedPack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchFeed = async () => {
      try {
        const data = await http<FeedPack[]>("/feed");
        if (mounted) setPacks(data || []);
      } catch (e) {
        console.error("Error fetching feed:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchFeed();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="p-6 lg:p-10 max-w-screen-2xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Feed</h1>
          <p className="text-on-surface-variant font-body mt-1">Contenido reciente de tus creadoras favoritas.</p>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        </div>
      ) : packs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-3xl border-dashed border-2 border-outline-variant/20">
          <span className="material-symbols-outlined text-6xl text-outline mb-4" style={{fontVariationSettings: "'FILL' 1"}}>rss_feed</span>
          <h3 className="text-xl font-headline font-bold">Tu feed personalizado</h3>
          <p className="text-on-surface-variant max-w-xs mt-2">
            Cuando sigas a otras creadoras, su contenido aparecerá aquí en orden cronológico.
          </p>
          <Link
            href="/explore"
            className="mt-8 bg-gradient-to-br from-primary to-primary-container text-white px-8 py-3.5 rounded-xl font-headline font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            Explorar Creadoras
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packs.map((pack) => (
            <Link
              key={pack.id}
              href={`/${pack.creator.slug}`}
              className="glass-panel rounded-3xl overflow-hidden hover:scale-[1.02] active:scale-95 transition-all group"
            >
              {pack.media?.[0]?.url && (
                <div className="aspect-video bg-surface-container-high overflow-hidden">
                  <img src={pack.media[0].url} alt={pack.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2">
                  {pack.creator.photoPath ? (
                    <img src={pack.creator.photoPath} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                      {pack.creator.fullName.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-bold text-on-surface-variant">@{pack.creator.slug}</span>
                </div>
                <h3 className="font-headline font-bold text-on-surface">{pack.title}</h3>
                {pack.description && (
                  <p className="text-xs text-on-surface-variant line-clamp-2">{pack.description}</p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <span className="font-headline font-black text-primary text-sm">
                    ${pack.price.toLocaleString("es-AR")} ARS
                  </span>
                  <span className="text-[10px] text-on-surface-variant/50 font-medium">
                    {new Date(pack.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
