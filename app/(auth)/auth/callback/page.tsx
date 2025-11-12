"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { http } from "@/lib/http-client";
import { setAuthSession, type User } from "@/store/use-auth-store";

// Contenido principal del callback; se envuelve en <Suspense>
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    const proceedWithTokens = async (access: string, refresh: string) => {
      try {
        // 1) Obtener el usuario con el accessToken
        const user = await http<User>("/auth/me", {
          headers: { Authorization: `Bearer ${access}` },
        });
        // 2) Guardar sesión completa y redirigir
        setAuthSession({ accessToken: access, refreshToken: refresh, user });
        router.push("/dashboard");
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        router.push("/login?error=fetch_user_failed");
      }
    };

    const tryCookieRefresh = async () => {
      try {
        // Intento de refresh usando cookie HttpOnly del backend
        const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/pina";
        const res = await fetch(`${api}/auth/refresh`, {
          method: "POST",
          // credentials: 'include' permite enviar cookies al backend
          credentials: "include",
        });
        if (!res.ok) {
          router.push("/login?error=auth_failed");
          return;
        }
        // Se espera que el backend devuelva tokens y, idealmente, el usuario
        const data: { accessToken: string; refreshToken: string; user: User } = await res.json();
        setAuthSession(data);
        router.push("/dashboard");
      } catch (error) {
        console.error("Error en refresh por cookie:", error);
        router.push("/login?error=auth_failed");
      }
    };

    if (accessToken && refreshToken) {
      // Caso 1: Ambos tokens vienen en la URL
      proceedWithTokens(accessToken, refreshToken);
    } else if (accessToken && !refreshToken) {
      // Caso 2: Sólo accessToken en la URL → intentar refresh vía cookie
      tryCookieRefresh();
    } else {
      // Caso 3: No hay tokens en la URL → intentar refresh directo por cookie
      tryCookieRefresh();
    }
  }, [searchParams, router]);

  return null;
}

// La página exportada debe estar envuelta en un suspense boundary
export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <p>Autenticando, por favor espera...</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}