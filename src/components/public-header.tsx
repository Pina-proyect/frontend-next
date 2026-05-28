"use client";

import React from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/use-auth-store";

export function PublicHeader() {
  const user = useAuthStore((s) => s.user);

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/70 dark:bg-slate-950/70 backdrop-blur-xl shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] border-none">
      <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto font-headline tracking-tight">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-on-surface dark:text-white hover:opacity-80 transition-opacity">
          Pina
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-on-surface/60 dark:text-white/60 hover:text-primary transition-colors duration-300 font-semibold">
            Descubrir
          </Link>
          <Link href="/explore" className="text-on-surface/60 dark:text-white/60 hover:text-primary transition-colors duration-300 font-semibold">
            Creadores
          </Link>
          <Link href="#" className="text-on-surface/60 dark:text-white/60 hover:text-primary transition-colors duration-300 font-semibold">
            Tendencias
          </Link>
          <Link href="#" className="text-on-surface/60 dark:text-white/60 hover:text-primary transition-colors duration-300 font-semibold">
            Precios
          </Link>
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <Link href="/dashboard">
              <button className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-2.5 rounded-lg text-sm font-semibold scale-95 hover:scale-100 active:scale-90 transition-transform shadow-md">
                Ir al Estudio
              </button>
            </Link>
          ) : (
            <Link href="/login">
              <button className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-2.5 rounded-lg text-sm font-semibold scale-95 hover:scale-100 active:scale-90 transition-transform shadow-md">
                Entrar al Estudio
              </button>
            </Link>
          )}
        </div>
      </div>
      
      {/* Inject Material Symbols for Public Pages */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0');
      `}} />
    </nav>
  );
}
