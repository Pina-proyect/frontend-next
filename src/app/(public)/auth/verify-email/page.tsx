"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { http } from "@/lib/http-client";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Token de verificación no proporcionado.");
      return;
    }

    http<{ message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(() => {
        setStatus("success");
        setMessage("Email verificado correctamente. Ya puedes iniciar sesión.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "El token es inválido o expiró.");
      });
  }, [searchParams]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl glass-panel p-8 text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <h1 className="text-xl font-bold">Verificando email...</h1>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
              ✅
            </div>
            <h1 className="text-xl font-bold mb-2">Email verificado</h1>
            <p className="text-on-surface-variant mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block rounded-lg bg-primary px-6 py-2 font-semibold text-on-primary"
            >
              Ir a iniciar sesión
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
              ❌
            </div>
            <h1 className="text-xl font-bold mb-2">Error de verificación</h1>
            <p className="text-on-surface-variant mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block rounded-lg bg-primary px-6 py-2 font-semibold text-on-primary"
            >
              Volver a iniciar sesión
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
