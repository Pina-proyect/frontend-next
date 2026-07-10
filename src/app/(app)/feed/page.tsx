"use client";

import React from "react";
import Link from "next/link";

export default function FeedPage() {
  return (
    <div className="p-6 lg:p-10 max-w-screen-2xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Feed</h1>
          <p className="text-on-surface-variant font-body mt-1">Contenido reciente de tus creadoras favoritas.</p>
        </div>
      </header>

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
    </div>
  );
}
