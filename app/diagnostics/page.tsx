// Página de diagnóstico del sistema (Server Component)
// Objetivo: verificar conectividad al backend, presencia de cookies HttpOnly
// y mostrar orientación de seguridad.

import React from "react";
import { cookies } from "next/headers";

async function getHealth(): Promise<{ status: string; timestamp: string; env: string; version: string } | null> {
  try {
    // Usamos ruta relativa para aprovechar rewrites (next.config.ts)
    const res = await fetch("/api/pina/health", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as any;
  } catch {
    return null;
  }
}

export default async function DiagnosticsPage() {
  // Lectura de cookies en el servidor (HttpOnly disponibles aquí).
  const cookieStore = cookies();
  const hasRefresh = cookieStore.has("refreshToken") || cookieStore.has("refresh_token");
  const hasAccess = cookieStore.has("accessToken");

  const health = await getHealth();

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <section>
        <h1 className="text-2xl font-semibold">Diagnostics</h1>
        <p className="text-sm text-muted-foreground">Herramienta interna para revisar sesión y conectividad.</p>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="text-lg font-medium">Backend Health</h2>
        {health ? (
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-semibold">status:</span> {health.status}
            </div>
            <div>
              <span className="font-semibold">env:</span> {health.env}
            </div>
            <div>
              <span className="font-semibold">version:</span> {health.version}
            </div>
            <div>
              <span className="font-semibold">timestamp:</span> {health.timestamp}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-red-600">No se pudo conectar al backend via /api/pina/health.</p>
        )}
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="text-lg font-medium">Cookies de Sesión</h2>
        <ul className="mt-2 text-sm list-disc list-inside">
          <li>
            refresh token presente: <span className={hasRefresh ? "text-green-700" : "text-red-700"}>{String(hasRefresh)}</span>
          </li>
          <li>
            access token presente: <span className={hasAccess ? "text-green-700" : "text-red-700"}>{String(hasAccess)}</span>
          </li>
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          Nota: Los valores de cookies HttpOnly no son accesibles en el cliente por seguridad. Aquí solo mostramos su presencia.
        </p>
      </section>

      <section className="rounded-xl border p-4">
        <h2 className="text-lg font-medium">Orientación</h2>
        <ul className="mt-2 text-sm list-disc list-inside">
          <li>Usar HttpOnly para `refresh_token` y nunca guardarlo en LocalStorage.</li>
          <li>Utilizar rewrites (`/api/pina`) en dev para compartir cookies entre frontend y backend.</li>
          <li>En producción, habilitar `secure: true` y SameSite apropiado.</li>
        </ul>
      </section>
    </main>
  );
}