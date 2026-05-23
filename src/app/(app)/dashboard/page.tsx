"use client";

import React, { useEffect, useState } from "react";
import { http } from "@/lib/http-client";
import { useAuthStore, type User } from "@/store/use-auth-store";

export default function DashboardPage() {
  const storedUser = useAuthStore((s) => s.user);
  
  // Using user data specifically for the "Hello" or stats if you want, but for now we follow the design specifically.
  // The layout already takes care of the navbar.

  return (
    <div className="p-6 lg:p-10 max-w-screen-2xl mx-auto w-full space-y-10 animate-in fade-in duration-500">
      
      {/* Welcome Snippet (Dynamic to User) */}
      <div className="md:hidden mb-2">
        <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Hola, {storedUser?.fullName?.split(' ')[0] || 'Creador'}</h2>
        <p className="text-on-surface-variant font-body">Bienvenido de nuevo a tu Estudio</p>
      </div>

      {/* Featured Creator Section (Bento Inspired) */}
      <section className="relative rounded-[24px] overflow-hidden bg-surface-container-low min-h-[450px] flex items-center shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] ring-1 ring-outline-variant/10 group">
        <div className="absolute inset-0 z-0">
          <img alt="Featured Creator" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAz9llOv80ht7G9EOH2JhAc3BHsvKfFWZPwz0z7uVSfMIztelsKkKoPudGGSnsSb0ZTLoGRUC4HKaNr949ZWVp8p5BpCu2jg0VC1tB5nYcxmSSvfHLu7wkhFcFUlI052aQepltTxA6B8ldvU-B7JAl2Tz3NWSLSmopLOPARTnsYfhkNl-zbdOOdd8LKN23ZhwkuJE01sruqWTOCvviHmDRfIZoUygHMxSJqR0zvuZbxNDWdcUoWX4btr25Ot-MffQa4jstvJ2JIuKr3"/>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        </div>
        <div className="relative z-10 px-8 lg:px-16 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary-fixed border border-primary/30 font-headline text-[10px] font-bold uppercase tracking-widest mb-4 backdrop-blur-md shadow-sm">
            Creadora del Mes
          </span>
          <h2 className="text-white font-headline text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
            Maya Sterling
          </h2>
          <p className="text-white/80 text-lg leading-relaxed mb-8 font-body drop-shadow">
            Dominando el arte de la narrativa digital. Únete al círculo exclusivo de Maya para acceder a sus flujos de trabajo cinematográficos y filosofía creativa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-4 rounded-xl font-headline font-bold flex items-center justify-center gap-2 hover:scale-[1.02] shadow-[0_12px_32px_-4px_rgba(67,82,165,0.3)] transition-all">
              <span>Seguir Estudio</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <button className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-headline font-bold hover:bg-white/20 transition-all text-center">
              Ver Galería
            </button>
          </div>
        </div>
      </section>

      {/* Content Library Section */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-3xl font-headline font-extrabold tracking-tight text-on-surface">Biblioteca de Contenido</h3>
            <p className="text-on-surface-variant font-body mt-1 text-sm">Clases magistrales premium y packs de recursos exclusivos.</p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-on-surface hover:bg-surface-container-lowest ring-1 ring-outline-variant/20 transition-colors">
              <span className="material-symbols-outlined text-xl">filter_list</span>
            </button>
            <button className="px-4 py-2 rounded-xl bg-surface-container-highest text-on-surface text-sm font-bold shadow-sm hover:bg-surface-container-lowest ring-1 ring-outline-variant/20 transition-colors">
                Ver Todo
            </button>
          </div>
        </div>

        {/* Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Video Card 1 */}
          <div className="lg:col-span-2 group relative rounded-2xl overflow-hidden aspect-video shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] ring-1 ring-outline-variant/10 cursor-pointer">
            <img alt="Video Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWYtQQszF4ZSZxuHxF-rk4Pr80II2y1pk3BdLuJOnZR2EIXLfBxRM20OeJkQ4YRkDY9jQv0n861hYiPuOEOv6b4815_3hVc-8gK5xRac1w1BQYtJLzXR5O0_3uGIaQcpU1SpSLjCVxYTdew5J2VFn0cuU7DFvvRrUGcNLMhwmGpdXivuO0pe2p94zxQmyfKHayxnZyro6JNL33iAPl0fjEkJUL0z8eE2SW3SzDKuQcLMuu4hvSjtTU-7CokZ39nKis-ySm7Q4kwFG9"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:bg-black/10 transition-colors duration-500"></div>
            
            {/* Live Tag */}
            <div className="absolute top-4 left-4">
              <div className="bg-black/30 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">Clase en Vivo</span>
              </div>
            </div>
            
            {/* Bottom Bar Info */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-black/40 backdrop-blur-xl border-t border-white/10 m-3 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-white font-headline font-bold text-xl drop-shadow">Teoría de la Iluminación</h4>
                <p className="text-white/60 text-xs font-semibold mt-0.5">4.2k Espectadores Activos</p>
              </div>
              <button className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-[0_12px_32px_-4px_rgba(67,82,165,0.3)] hover:scale-105 transition-transform">
                Ver
              </button>
            </div>
          </div>

          {/* Video Card 2 */}
          <div className="group relative rounded-2xl overflow-hidden shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] aspect-[4/5] lg:aspect-auto ring-1 ring-outline-variant/10 cursor-pointer">
            <img alt="Assets Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAON-MSGv4XjSz0OzYIHYftxoisuvwoo0_6a9w6y6MdqpvSboI_7S0-HYPpRLdr4p_ZCKeKtk-D0FNSQMTB9l8A_StlIQ3P36JdZkY9ZstnbCYOvurXpZtm93r7LNC-ExwcQv6iog_CfH1wJ2uztebX_VsgO0XqMW7oqMOKgYpNKJvWChaqJQzpnBf_dFfnyAIzQ96V_zt8eeBC0HSz_UtHjIh-Av6fJe3GPvXLw1jDYRHXFFSCX5gBMkR94So8UQdTdF-nR9EFuku0"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 p-5 w-full">
              <h4 className="text-white font-headline font-bold text-lg mb-1 drop-shadow">Bundle de Ajustes 04</h4>
              <p className="text-white/70 text-xs mb-4 font-medium">24 perfiles de Lightroom en alta resolución</p>
              <button className="w-full bg-white text-primary px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-surface-container-low transition-colors shadow-sm">
                Desbloquear Pack
              </button>
            </div>
          </div>

          {/* Video Card 3 */}
          <div className="group relative rounded-2xl overflow-hidden shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] aspect-[4/5] lg:aspect-auto ring-1 ring-outline-variant/10 cursor-pointer">
            <img alt="Course Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6whOxas_yCKyC3fzfavMjE14IhUoGWGM4SV4i56fwuuu2s4eE5iJqVkXAAuj10aRmh_YEFdbkzJLmd7dWnEGEewTVBt6wAkBdUKdNOp1a7qNwRSCBWsz_l0jOV8j-Axjh9ySbDbcgfrNFTbL_dzxSxXhyvW0GP61x1xc2-tQo1l__V0xh8QXdp_r40k9kJDaPuO6mziCYyR2NPk-mmhvrc17XQYyzH3ITa2gOdwxKJz-1eHRqer-qEv3wfGaYKtBM5HyST0y8ANuo"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 p-5 w-full">
              <h4 className="text-white font-headline font-bold text-lg mb-1 drop-shadow">Maestría en Color</h4>
              <p className="text-white/70 text-xs mb-4 font-medium">Esenciales de corrección de color</p>
              <button className="w-full bg-white text-primary px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-surface-container-low transition-colors shadow-sm">
                 Desbloquear Curso
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics / Insights Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {/* Earnings Stat */}
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] ring-1 ring-outline-variant/10 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-bold">+12.5%</span>
          </div>
          <h5 className="text-on-surface-variant font-headline text-[10px] font-bold uppercase tracking-widest mb-1">Ingresos Totales</h5>
          <p className="text-3xl font-headline font-extrabold text-on-surface">$24,480.00</p>
        </div>

        {/* Subs Stat */}
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] ring-1 ring-outline-variant/10 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined">group_add</span>
            </div>
            <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-bold">+8.2%</span>
          </div>
          <h5 className="text-on-surface-variant font-headline text-[10px] font-bold uppercase tracking-widest mb-1">Nuevos Suscriptores</h5>
          <p className="text-3xl font-headline font-extrabold text-on-surface">1,204</p>
        </div>

        {/* Conversion Stat */}
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] ring-1 ring-outline-variant/10 md:col-span-1 hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-xl bg-tertiary-container/10 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined">auto_graph</span>
            </div>
          </div>
          <h5 className="text-on-surface-variant font-headline text-[10px] font-bold uppercase tracking-widest mb-1">Tasa de Conversión</h5>
          <p className="text-3xl font-headline font-extrabold text-on-surface">4.8%</p>
        </div>
      </section>
    </div>
  );
}