"use client";

import React, { useEffect, useState } from "react";
import { Wallet } from "@mercadopago/sdk-react";
import { http } from "@/lib/http-client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface Donation {
  id: string;
  quantity: number;
  message: string | null;
  donorName: string | null;
  createdAt: string;
  donor?: {
    fullName: string;
    slug: string;
  } | null;
}

interface DonationBoxProps {
  creatorId: string;
  creatorName: string;
  pinaPrice: number;
}

export default function DonationBox({ creatorId, creatorName, pinaPrice }: DonationBoxProps) {
  const { toast } = useToast();
  
  // Form State
  const [quantity, setQuantity] = useState<number>(3); // 3 por defecto
  const [customQuantity, setCustomQuantity] = useState<string>("");
  const [donorName, setDonorName] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [donationPreferenceId, setDonationPreferenceId] = useState<string | null>(null);

  // Donations List State
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loadingDonations, setLoadingDonations] = useState<boolean>(true);

  // Cargar donaciones públicas al inicio
  useEffect(() => {
    let mounted = true;
    const fetchDonations = async () => {
      try {
        const data = await http<Donation[]>(`/creators/${creatorId}/donations`);
        if (mounted) {
          setDonations(data || []);
        }
      } catch (error) {
        console.error("Error al obtener donaciones públicas:", error);
      } finally {
        if (mounted) {
          setLoadingDonations(false);
        }
      }
    };

    fetchDonations();
    return () => {
      mounted = false;
    };
  }, [creatorId]);

  // Manejador del preset de piñas
  const handlePresetSelect = (num: number) => {
    setQuantity(num);
    setCustomQuantity("");
  };

  // Manejador de cantidad personalizada
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomQuantity(value);
    
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setQuantity(parsed);
    } else {
      setQuantity(1); // Mínimo 1
    }
  };

  // Enviar donación a Mercado Pago
  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await http<{ id: string; init_point: string }>("/payments/pinas", {
        method: "POST",
        body: JSON.stringify({
          creatorId,
          quantity,
          message: message.trim() || undefined,
          donorName: donorName.trim() || undefined,
        }),
      });

      if (response && response.id) {
        setDonationPreferenceId(response.id);
        setIsSubmitting(false);
      } else {
        throw new Error("No se pudo generar la preferencia de pago.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al iniciar pago",
        description: error.message || "Ocurrió un error al procesar la donación.",
      });
      setIsSubmitting(false);
    }
  };

  const totalPrice = quantity * pinaPrice;

  return (
    <div className="space-y-6">
      {/* Donation Form Card */}
      <div className="glass-panel rounded-3xl p-8 shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] ring-1 ring-outline-variant/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
          </div>
          <div>
            <h3 className="font-headline font-extrabold text-lg text-on-surface">Apoya este Estudio</h3>
            <p className="text-xs text-on-surface-variant font-medium">Envíame Pinas como muestra de apoyo</p>
          </div>
        </div>

        <form onSubmit={handleDonate} className="space-y-5">
          {/* Preset Buttons */}
          <div>
            <label className="block font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Cantidad de Pinas 🍍
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 5, 10].map((num) => {
                const isSelected = quantity === num && !customQuantity;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePresetSelect(num)}
                    className={`h-11 rounded-xl font-headline font-bold text-sm transition-all duration-200 active:scale-95 ${
                      isSelected
                        ? "bg-primary text-white shadow-md shadow-primary/15"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {num} 🍍
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Quantity Input */}
          <div>
            <label className="block font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              O cantidad personalizada
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                placeholder="Ej: 7"
                value={customQuantity}
                onChange={handleCustomChange}
                className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:bg-surface-container-high transition-all outline-none font-medium"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg">🍍</span>
            </div>
          </div>

          {/* Donor Info Inputs */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Tu Nombre (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Anónimo o tu nombre"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:bg-surface-container-high transition-all outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Mensaje de apoyo (Opcional)
              </label>
              <textarea
                placeholder="Déjale un mensaje de agradecimiento..."
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:bg-surface-container-high transition-all outline-none font-medium resize-none"
              />
            </div>
          </div>

          {/* Summary and Pay CTA */}
          <div className="pt-4 border-t border-outline-variant/10 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-on-surface-variant font-medium">Cada Pina vale:</span>
              <span className="text-on-surface font-headline font-bold">
                ${pinaPrice.toLocaleString("es-AR")} ARS
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant font-bold">Total a enviar:</span>
              <span className="text-2xl font-headline font-black text-primary">
                ${totalPrice.toLocaleString("es-AR")} ARS
              </span>
            </div>

            {donationPreferenceId ? (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <Wallet initialization={{ preferenceId: donationPreferenceId }} />
                </div>
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDonationPreferenceId(null)}
                    className="rounded-xl text-xs"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-4 rounded-2xl font-headline font-bold text-sm shadow-[0_12px_32px_-4px_rgba(67,82,165,0.2)] hover:shadow-[0_12px_32px_-4px_rgba(67,82,165,0.3)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    <span>Conectando con Mercado Pago...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">favorite</span>
                    <span>Enviar {quantity} Pina(s)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Recipient Feed / Last Donations */}
      <div className="glass-panel rounded-3xl p-8 shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] ring-1 ring-outline-variant/10">
        <h3 className="font-headline font-extrabold text-sm text-on-surface mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          Últimos Apoyos
        </h3>

        {loadingDonations ? (
          <div className="flex flex-col items-center py-6 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin"></div>
            <p className="text-xs text-on-surface-variant font-medium">Cargando feed...</p>
          </div>
        ) : donations.length === 0 ? (
          <p className="text-xs text-on-surface-variant italic text-center py-4">
            Aún no hay apoyos registrados. ¡Sé la primera en apoyar este estudio!
          </p>
        ) : (
          <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar">
            {donations.map((donation) => (
              <div
                key={donation.id}
                className="bg-surface-container-low rounded-2xl p-4 space-y-2 text-sm relative animate-in fade-in duration-300"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="font-headline font-bold text-on-surface leading-tight truncate">
                    {donation.donorName || (donation.donor?.fullName) || "Donante anónimo"}
                  </div>
                  <span className="flex items-center gap-1 bg-secondary text-white font-headline font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                    {donation.quantity} 🍍
                  </span>
                </div>
                {donation.message && (
                  <p className="text-on-surface-variant font-medium text-xs leading-relaxed break-words bg-surface-container-lowest/50 p-2.5 rounded-xl border border-outline-variant/5">
                    "{donation.message}"
                  </p>
                )}
                <div className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest text-right">
                  {new Date(donation.createdAt).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
