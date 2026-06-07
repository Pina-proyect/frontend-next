"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function PaymentPendingContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="max-w-md w-full glass-panel rounded-3xl p-10 text-center border border-outline-variant/10 shadow-2xl">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-yellow-500/10 text-yellow-600">
          <span className="material-symbols-outlined text-4xl animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
            schedule
          </span>
        </div>

        <h1 className="text-3xl font-headline font-black text-on-surface mb-2">
          Pago en proceso
        </h1>

        <p className="text-on-surface-variant mb-10 leading-relaxed">
          Tu donación está siendo procesada. Esto puede tomar unos minutos según el método de pago. Te avisaremos por email cuando se confirme.
        </p>

        {paymentId && (
          <p className="text-[10px] text-on-surface-variant/40 mb-8 font-mono">
            Ref: {paymentId}
          </p>
        )}

        <div className="space-y-3">
          <Link href="/dashboard" className="block">
            <Button className="w-full h-14 rounded-2xl bg-primary text-white font-bold hover:opacity-90 shadow-lg shadow-primary/20">
              Ir a mi Panel
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

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PaymentPendingContent />
    </Suspense>
  );
}
