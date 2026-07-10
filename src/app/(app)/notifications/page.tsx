"use client";

import React from "react";
import Link from "next/link";

export default function NotificationsPage() {
  return (
    <div className="p-6 lg:p-10 max-w-screen-2xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Notificaciones</h1>
          <p className="text-on-surface-variant font-body mt-1">Mantente al día con tu actividad en el estudio.</p>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-3xl border-dashed border-2 border-outline-variant/20">
        <span className="material-symbols-outlined text-6xl text-outline mb-4" style={{fontVariationSettings: "'FILL' 1"}}>notifications_none</span>
        <h3 className="text-xl font-headline font-bold">Sin novedades</h3>
        <p className="text-on-surface-variant max-w-xs mt-2">
          Aún no tienes notificaciones. Cuando tus seguidores interactúen con tu contenido, aparecerán aquí.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 bg-gradient-to-br from-primary to-primary-container text-white px-8 py-3.5 rounded-xl font-headline font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
        >
          Volver al Panel
        </Link>
      </div>
    </div>
  );
}
