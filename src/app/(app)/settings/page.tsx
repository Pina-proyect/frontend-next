"use client";

import React, { useState } from "react";
import { useAuthStore, setAuthSession, getRefreshToken } from "@/store/use-auth-store";
import { http } from "@/lib/http-client";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  
  // Monetization State
  const [mpAccessToken, setMpAccessToken] = useState(user?.mpAccessToken || "");
  const [pinaPrice, setPinaPrice] = useState(user?.pinaPrice || 1000);
  const [donationGoalTitle, setDonationGoalTitle] = useState(user?.donationGoalTitle || "");
  const [donationGoalAmount, setDonationGoalAmount] = useState(user?.donationGoalAmount || 0);

  const handleSaveMonetization = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedUser = await http<any>("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({
          mpAccessToken,
          pinaPrice: Number(pinaPrice),
          donationGoalTitle,
          donationGoalAmount: Number(donationGoalAmount),
        }),
      });

      // Update the global store
      setAuthSession({
        accessToken: accessToken!,
        refreshToken: getRefreshToken()!,
        user: { ...user!, ...updatedUser },
      });

      toast({
        title: "Configuración guardada",
        description: "Tus opciones de monetización han sido actualizadas con éxito.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Ocurrió un error al guardar la configuración.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 max-w-screen-xl mx-auto w-full space-y-10 animate-in fade-in duration-500">
      <div>
        <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Configuración</h2>
        <p className="text-on-surface-variant font-body mt-1">Gestiona los detalles de tu estudio, perfil y cobros.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Nav Sidebar (Placeholder for future settings tabs) */}
        <div className="col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-xl font-bold text-sm bg-surface-container-lowest text-primary shadow-sm ring-1 ring-outline-variant/10">
            Monetización y Donaciones
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container-highest transition-colors">
            Perfil Público
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container-highest transition-colors">
            Cuenta y Seguridad
          </button>
        </div>

        {/* Settings Content */}
        <div className="col-span-1 lg:col-span-2 space-y-8">
          
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] ring-1 ring-outline-variant/10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <h3 className="text-xl font-headline font-bold text-on-surface">Dóname una Piña</h3>
                <p className="text-sm text-on-surface-variant font-medium">Configura cómo tus seguidores te apoyan económicamente.</p>
              </div>
            </div>

            <form onSubmit={handleSaveMonetization} className="space-y-6">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">Access Token de MercadoPago</label>
                  <input 
                    type="password" 
                    value={mpAccessToken}
                    onChange={(e) => setMpAccessToken(e.target.value)}
                    placeholder="APP_USR-XXXXXXXXX-XXXXX-XXXXXXXXX-XXXXXXXXX"
                    className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  />
                  <p className="text-xs text-on-surface-variant mt-2 font-medium">
                    Necesitas crear una Aplicación en MercadoPago Developers y copiar aquí tus <span className="text-primary cursor-pointer hover:underline">Credenciales de Producción</span>.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">Valor de 1 Piña (ARS)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                    <input 
                      type="number" 
                      min="100"
                      value={pinaPrice}
                      onChange={(e) => setPinaPrice(Number(e.target.value))}
                      className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl pl-8 pr-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/20">
                <h4 className="text-md font-headline font-bold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">flag</span>
                  Objetivo de Recaudación (Opcional)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Título del Objetivo</label>
                    <input 
                      type="text" 
                      value={donationGoalTitle}
                      onChange={(e) => setDonationGoalTitle(e.target.value)}
                      placeholder="Ej. Nueva PC para Stream"
                      className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-wider">Monto a alcanzar (ARS)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                      <input 
                        type="number" 
                        value={donationGoalAmount}
                        onChange={(e) => setDonationGoalAmount(Number(e.target.value))}
                        className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl pl-8 pr-4 py-3 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-[0_8px_16px_-4px_rgba(67,82,165,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
