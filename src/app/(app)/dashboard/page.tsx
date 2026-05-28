"use client";

import React, { useEffect, useState } from "react";
import { http } from "@/lib/http-client";
import { useAuthStore } from "@/store/use-auth-store";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

interface Donation {
  id: string;
  quantity: number;
  message: string | null;
  donorName: string | null;
  createdAt: string;
}

const getGenderedNiche = (gender: string, niche: string | null) => {
  const prefix = gender === "creador" ? "Creador" : "Creadora";
  if (!niche) return `${prefix} Digital`;
  switch (niche) {
    case "photography": return `${prefix} de Fotografía`;
    case "film": return `${prefix} de Cine y Video`;
    case "digital-art": return `${prefix} de Arte Digital`;
    default: return `${prefix} ${niche}`;
  }
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();
  
  const [donations, setDonations] = useState<Donation[]>([]);
  const [mediaCount, setMediaCount] = useState(0);
  const [packsCount, setPacksCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    
    let active = true;
    const fetchDashboardData = async () => {
      try {
        const [donationsData, mediaData, packsData] = await Promise.all([
          http<Donation[]>(`/donations/public/${user.id}`).catch(() => []),
          http<any[]>("/media/my-content").catch(() => []),
          http<any[]>("/packs/my-packs").catch(() => [])
        ]);
        
        if (active) {
          setDonations(donationsData || []);
          setMediaCount(mediaData?.length || 0);
          setPacksCount(packsData?.length || 0);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    
    fetchDashboardData();
    return () => { active = false; };
  }, [user?.id]);

  // Cálculos dinámicos
  const totalPinas = donations.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
  const pinaPrice = user?.pinaPrice || 1000;
  const totalEarnings = totalPinas * pinaPrice;

  const goalAmount = user?.donationGoalAmount || 0;
  const goalTitle = user?.donationGoalTitle || "";
  const goalProgress = goalAmount > 0 ? Math.min((totalEarnings / goalAmount) * 100, 100) : 0;

  const handleOpenNewPost = () => {
    window.dispatchEvent(new Event("open-new-post-modal"));
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 max-w-screen-2xl mx-auto w-full flex h-[50vh] items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
           <p className="text-on-surface-variant font-label text-sm animate-pulse">Cargando Panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-screen-2xl mx-auto w-full space-y-8 animate-in fade-in duration-500">
      
      {/* Saludo de Bienvenida (Estilo Atelier) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">
            ¡Hola, {user?.fullName?.split(" ")[0]}!
          </h2>
          <p className="text-on-surface-variant font-body mt-1 text-sm md:text-base">
            Bienvenido al panel de control de tu Estudio como <span className="text-primary font-bold">{getGenderedNiche(user?.gender || "creadora", user?.niche || null)}</span>.
          </p>
        </div>
        
        {/* Atajo rápido para ver perfil público */}
        {user?.slug && (
          <Link 
            href={`/${user.slug}`} 
            target="_blank"
            className="inline-flex items-center gap-2 bg-surface-container-high hover:bg-surface-container-highest text-primary font-headline font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            Ver mi Estudio Público
          </Link>
        )}
      </div>

      {/* Alerta de cuenta no conectada (Mercado Pago) */}
      {!user?.mpAccessToken && (
        <div className="p-5 bg-gradient-to-r from-secondary/15 to-primary/10 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ring-1 ring-secondary/20 border-none">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            <div>
              <p className="text-sm font-bold text-on-surface">Configura tus donaciones</p>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                Aún no has conectado tu cuenta de Mercado Pago. Los visitantes no podrán donarte piñas hasta que la enlaces.
              </p>
            </div>
          </div>
          <Link
            href="/settings?tab=monetization"
            className="w-full md:w-auto text-center bg-primary text-white px-5 py-2.5 rounded-xl font-headline font-bold text-xs shadow-md hover:scale-[1.02] active:scale-95 transition-all"
          >
            Conectar Cuenta
          </Link>
        </div>
      )}

      {/* Bento Grid: Estadísticas Principales */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tarjeta de Ingresos Acumulados */}
        <div className="bg-surface-container-low p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
              Enviados
            </span>
          </div>
          <h5 className="text-on-surface-variant font-headline text-[10px] font-bold uppercase tracking-widest mb-1">Ingresos Estimados</h5>
          <p className="text-3xl font-headline font-black text-on-surface">
            ${totalEarnings.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-on-surface-variant font-medium mt-2">
            Valor de la piña: ${pinaPrice} ARS
          </p>
        </div>

        {/* Tarjeta de Piñas Recibidas */}
        <div className="bg-surface-container-low p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-xl">favorite</span>
            </div>
            <span className="text-[10px] font-bold text-secondary bg-secondary/10 px-3 py-1 rounded-full uppercase tracking-wider">
              {totalPinas === 1 ? "1 Piña" : `${totalPinas} Piñas`}
            </span>
          </div>
          <h5 className="text-on-surface-variant font-headline text-[10px] font-bold uppercase tracking-widest mb-1">Apoyos Totales</h5>
          <p className="text-3xl font-headline font-black text-on-surface">
            {totalPinas}
          </p>
          <p className="text-xs text-on-surface-variant font-medium mt-2">
            Total de cafecitos recibidos aprobados
          </p>
        </div>

        {/* Tarjeta de Meta / Objetivo */}
        <div className="bg-surface-container-low p-6 md:p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary-fixed/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined text-xl">flag</span>
            </div>
            {goalAmount > 0 && (
              <span className="text-[10px] font-bold text-on-surface bg-surface-container-highest px-3 py-1 rounded-full uppercase tracking-wider">
                {goalProgress.toFixed(0)}%
              </span>
            )}
          </div>
          
          {goalAmount > 0 ? (
            <div className="space-y-3">
              <div>
                <h5 className="text-on-surface-variant font-headline text-[10px] font-bold uppercase tracking-widest mb-1">Meta: {goalTitle}</h5>
                <p className="text-2xl font-headline font-black text-on-surface">
                  ${totalEarnings.toLocaleString("es-AR")} / ${goalAmount.toLocaleString("es-AR")}
                </p>
              </div>
              
              {/* Barra de progreso - Regla No-Line */}
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 rounded-full"
                  style={{ width: `${goalProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div>
              <h5 className="text-on-surface-variant font-headline text-[10px] font-bold uppercase tracking-widest mb-1">Objetivo de Recaudación</h5>
              <p className="text-lg font-headline font-bold text-on-surface-variant italic">
                Sin meta activa
              </p>
              <Link 
                href="/settings?tab=monetization" 
                className="text-xs text-primary font-bold hover:underline inline-block mt-3"
              >
                Configurar un objetivo creativo
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Grid Secundario: Actividad Reciente & Atajos */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Actividad Reciente / Lista de Donaciones (Col Span 2) */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm ring-1 ring-outline-variant/10 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-headline font-black text-on-surface mb-1">Actividad Reciente</h3>
            <p className="text-xs text-on-surface-variant font-medium mb-6">Últimos apoyos y mensajes de tu comunidad de fans.</p>

            {donations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined text-4xl text-outline mb-3 animate-pulse">favorite</span>
                <p className="text-sm font-bold text-on-surface">El estudio está preparado</p>
                <p className="text-xs text-on-surface-variant max-w-xs mt-1 leading-relaxed">
                  Cuando recibas tus primeras donaciones de Piñas, aparecerán listadas aquí junto con sus mensajes.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/10 max-h-[350px] overflow-y-auto pr-2 space-y-4">
                {donations.map((donation) => (
                  <div key={donation.id} className="pt-4 first:pt-0 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-sm font-bold text-on-surface">
                          {donation.donorName || "Donante Anónimo"}
                        </span>
                        <span className="text-xs text-on-surface-variant font-medium ml-2">
                          donó {donation.quantity} {donation.quantity === 1 ? "Piña" : "Piñas"}
                        </span>
                      </div>
                      <span className="text-[10px] text-outline font-bold uppercase tracking-wider">
                        {new Date(donation.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short"
                        })}
                      </span>
                    </div>
                    {donation.message && (
                      <p className="text-xs bg-surface-container-low text-on-surface-variant p-3.5 rounded-xl italic font-medium leading-relaxed">
                        "{donation.message}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Acciones Rápidas & Estado del Estudio */}
        <div className="space-y-6">
          
          {/* Atajos Rápidos */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm ring-1 ring-outline-variant/10">
            <h3 className="text-xl font-headline font-black text-on-surface mb-6">Atajos del Estudio</h3>
            
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleOpenNewPost}
                className="w-full flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container-high rounded-2xl transition-all hover:-translate-y-0.5 active:scale-95 group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-xl">add_circle</span>
                  </div>
                  <div>
                    <span className="block text-sm font-bold">Nueva Publicación</span>
                    <span className="block text-[10px] text-on-surface-variant mt-0.5">Sube imágenes o videos</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
              </button>

              <Link
                href="/settings?tab=profile"
                className="w-full flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container-high rounded-2xl transition-all hover:-translate-y-0.5 active:scale-95 group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-xl">account_circle</span>
                  </div>
                  <div>
                    <span className="block text-sm font-bold">Configurar Perfil</span>
                    <span className="block text-[10px] text-on-surface-variant mt-0.5">Bio, slug y redes sociales</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors">chevron_right</span>
              </Link>

              <Link
                href="/settings?tab=monetization"
                className="w-full flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container-high rounded-2xl transition-all hover:-translate-y-0.5 active:scale-95 group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-tertiary-container/10 flex items-center justify-center text-tertiary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-xl">payments</span>
                  </div>
                  <div>
                    <span className="block text-sm font-bold">Ajustes de Cobros</span>
                    <span className="block text-[10px] text-on-surface-variant mt-0.5">Precio de Piña y Mercado Pago</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-tertiary transition-colors">chevron_right</span>
              </Link>
            </div>
          </div>

          {/* Estadísticas de Contenido */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm ring-1 ring-outline-variant/10">
            <h3 className="text-xl font-headline font-black text-on-surface mb-6">Estado de la Galería</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Link href="/content" className="p-4 bg-surface-container-low hover:bg-surface-container-high rounded-2xl text-center transition-all block group">
                <span className="block text-3xl font-headline font-black text-primary group-hover:scale-105 transition-transform">
                  {mediaCount}
                </span>
                <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-2">
                  Publicaciones
                </span>
              </Link>

              <Link href="/packs" className="p-4 bg-surface-container-low hover:bg-surface-container-high rounded-2xl text-center transition-all block group">
                <span className="block text-3xl font-headline font-black text-secondary group-hover:scale-105 transition-transform">
                  {packsCount}
                </span>
                <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-2">
                  Packs Activos
                </span>
              </Link>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}