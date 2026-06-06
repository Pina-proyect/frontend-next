"use client";

import React, { useState } from "react";
import { Wallet } from "@mercadopago/sdk-react";
import { http } from "@/lib/http-client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

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
  category: { name: string };
  media: Media[];
}

export default function CreatorContent({ packs: initialPacks, creatorSlug }: { packs: ContentPack[], creatorSlug: string }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("paquetes");
  const [packs, setPacks] = useState(initialPacks);
  const [purchasedPacks, setPurchasedPacks] = useState<string[]>([]);
  const [buying, setBuying] = useState<string | null>(null);
  const [checkoutPackId, setCheckoutPackId] = useState<string | null>(null);
  const [checkoutPreferenceId, setCheckoutPreferenceId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const handleRealPurchase = async (packId: string) => {
    setBuying(packId);
    try {
      const response = await http<{ id: string; init_point: string }>("/payments/create-preference", {
        method: "POST",
        body: JSON.stringify({ packId }),
      });
      
      if (response.id) {
        setCheckoutPackId(packId);
        setCheckoutPreferenceId(response.id);
      }
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error de Pago", 
        description: "Debes estar registrado para realizar una compra protegida." 
      });
    } finally {
      setBuying(null);
    }
  };

  return (
    <section className="mt-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-outline-variant/10 mb-12">
        <div className="flex gap-12 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab("biblioteca")}
            className={`pb-6 font-headline font-bold text-lg whitespace-nowrap transition-all ${activeTab === "biblioteca" ? "border-b-2 border-primary text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            Biblioteca Pública
          </button>
          <button 
            onClick={() => setActiveTab("paquetes")}
            className={`pb-6 font-headline font-bold text-lg whitespace-nowrap transition-all ${activeTab === "paquetes" ? "border-b-2 border-primary text-on-surface" : "text-on-surface-variant hover:text-on-surface"}`}
          >
            Paquetes Premium
          </button>
        </div>

        {/* Toggle Modo Vista Previa */}
        <div className="pb-4 md:pb-0">
          <Button 
            variant="outline" 
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`rounded-full border-primary/20 ${isPreviewMode ? 'bg-primary/10 text-primary' : 'text-on-surface-variant'}`}
          >
            <span className="material-symbols-outlined mr-2">
              {isPreviewMode ? 'visibility_off' : 'visibility'}
            </span>
            {isPreviewMode ? 'Modo Invitado (Blur ON)' : 'Vista Previa'}
          </Button>
        </div>
      </div>

      {activeTab === "paquetes" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packs.map((pack) => {
            const isUnlocked = !isPreviewMode && purchasedPacks.includes(pack.id);
            return (
              <div key={pack.id} className="glass-panel rounded-3xl overflow-hidden border border-outline-variant/10 group bg-surface">
                <div className="aspect-video relative overflow-hidden bg-black">
                  <img 
                    src={pack.media[0]?.url} 
                    className={`w-full h-full object-cover transition-all duration-700 ${!isUnlocked ? "blur-2xl opacity-50 scale-110" : "group-hover:scale-105"}`} 
                    alt="" 
                  />
                  
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/20 backdrop-blur-[2px]">
                       <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 border border-white/20">
                          <span className="material-symbols-outlined text-white text-3xl">lock</span>
                       </div>
                       <p className="text-white font-headline font-bold text-lg leading-tight shadow-sm">Contenido Exclusivo</p>
                       <p className="text-white/70 text-xs mt-1 uppercase tracking-widest font-bold">Pack: {pack.title}</p>
                    </div>
                  )}

                  <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    {pack.category.name}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-headline font-bold text-on-surface">{pack.title}</h3>
                    <p className="text-on-surface-variant text-sm line-clamp-2 mt-1">{pack.description}</p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-outline uppercase">Precio de Acceso</span>
                      <span className="text-2xl font-headline font-black text-primary">${pack.price}</span>
                    </div>
                    {isUnlocked ? (
                      <Button variant="outline" className="rounded-xl border-green-500 text-green-500 hover:bg-green-50">
                        <span className="material-symbols-outlined mr-2">check_circle</span>
                        Desbloqueado
                      </Button>
                    ) : checkoutPackId === pack.id && checkoutPreferenceId ? (
                      <div className="flex flex-col gap-2 items-end">
                        <Wallet initialization={{ preferenceId: checkoutPreferenceId }} />
                        <button
                          onClick={() => { setCheckoutPackId(null); setCheckoutPreferenceId(null); }}
                          className="text-xs text-on-surface-variant hover:text-on-surface underline"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => handleRealPurchase(pack.id)}
                        disabled={buying === pack.id}
                        className="rounded-xl bg-on-surface text-surface hover:opacity-90"
                      >
                        {buying === pack.id ? "Procesando..." : "Liberar Pack"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {packs.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-on-surface-variant italic">Esta creadora aún no tiene paquetes premium disponibles.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <p className="col-span-full text-on-surface-variant italic text-center py-20">La biblioteca pública compartida aparecerá aquí próximamente.</p>
        </div>
      )}
    </section>
  );
}
