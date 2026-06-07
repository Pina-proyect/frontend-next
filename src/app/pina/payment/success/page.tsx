"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const preferenceId = searchParams.get("preference_id");

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="max-w-md w-full glass-panel rounded-3xl p-10 text-center border border-outline-variant/10 shadow-2xl">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-500/10 text-green-500">
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            celebration
          </span>
        </div>

        <h1 className="text-3xl font-headline font-black text-on-surface mb-2">
          ¡Pina enviada con éxito!
        </h1>

        <p className="text-on-surface-variant mb-6 leading-relaxed">
          Tu apoyo fue procesado. La creadora recibirá una notificación y tu donación aparecerá en su muro de apoyos.
        </p>

        {(paymentId || preferenceId) && (
          <p className="text-[10px] text-on-surface-variant/40 mb-8 font-mono">
            {paymentId && `Pago: ${paymentId}`}
            {paymentId && preferenceId && " · "}
            {preferenceId && `Pref: ${preferenceId}`}
          </p>
        )}

        <div className="space-y-3">
          <Link href="/explore" className="block">
            <Button className="w-full h-14 rounded-2xl bg-primary text-white font-bold hover:opacity-90 shadow-lg shadow-primary/20">
              Descubrir más creadoras
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="ghost" className="w-full h-14 rounded-2xl text-on-surface-variant font-bold">
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,1,0');
      `}} />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
