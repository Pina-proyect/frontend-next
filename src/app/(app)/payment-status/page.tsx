"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const isSuccess = status === "success";

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="max-w-md w-full glass-panel rounded-3xl p-10 text-center border border-outline-variant/10 shadow-2xl">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isSuccess ? 'bg-green-500/10 text-green-500' : 'bg-error/10 text-error'}`}>
          <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>
            {isSuccess ? 'check_circle' : 'error'}
          </span>
        </div>

        <h1 className="text-3xl font-headline font-black text-on-surface mb-2">
          {isSuccess ? '¡Pago Exitoso!' : 'Algo salió mal'}
        </h1>
        
        <p className="text-on-surface-variant mb-10 leading-relaxed">
          {isSuccess 
            ? 'Tu pack se está liberando. En unos segundos verás el contenido desbloqueado en tu biblioteca.' 
            : 'No pudimos procesar tu pago. Por favor, intenta de nuevo o comunícate con soporte.'}
        </p>

        <div className="space-y-4">
          <Link href="/dashboard">
            <Button className="w-full h-14 rounded-2xl bg-primary text-white font-bold hover:opacity-90 shadow-lg shadow-primary/20">
              Ir a mi Panel
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="ghost" className="w-full h-14 rounded-2xl text-on-surface-variant font-bold">
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,1,0');
      `}} />
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<div>Cargando estado del pago...</div>}>
      <PaymentStatusContent />
    </Suspense>
  );
}
