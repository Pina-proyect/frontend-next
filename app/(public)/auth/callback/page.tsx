"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { http } from "@/lib/http-client";
import { setAuthSession, type User } from "@/store/use-auth-store";
import { useToast } from "@/components/ui/use-toast";

// Contenido principal del callback; se envuelve en <Suspense>
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  // Bandera para evitar intentar refresh por cookie si el backend no está corriendo
  const disableCookieRefresh = process.env.NEXT_PUBLIC_DISABLE_REFRESH === "true";

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
        toast({
          title: "Autenticación exitosa",
          description: "Has iniciado sesión correctamente",
        });
        router.push("/dashboard");
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        toast({
          variant: "destructive",
          title: "Error al cargar tu perfil",
          description: "No se pudo obtener tus datos",
        });
        router.push("/login?error=fetch_user_failed");
      }
    };

    const tryCookieRefresh = async () => {
      // Si el refresh está deshabilitado por configuración, redirigimos a login
      if (disableCookieRefresh) {
        toast({
          variant: "destructive",
          title: "Sesión no disponible",
          description: "Backend no disponible. Inicia sesión cuando esté activo.",
        });
        router.push("/login");
        return;
      }
      try {
        // Intento de refresh usando cookie HttpOnly del backend
        // Nota: usamos ruta relativa para aprovechar los rewrites y el mismo origen,
        // lo cual permite el envío de cookies HttpOnly sin CORS.
        const api = process.env.NEXT_PUBLIC_API_URL || "/api/pina";
        const res = await fetch(`${api}/auth/refresh`, {
          method: "POST",
          // credentials: 'include' permite enviar cookies al backend
          credentials: "include",
        });
        if (!res.ok) {
          toast({
            variant: "destructive",
            title: "Autenticación fallida",
            description: "No fue posible restaurar la sesión",
          });
          router.push("/login?error=auth_failed");
          return;
        }
        // Se espera que el backend devuelva tokens y, idealmente, el usuario
        const data: { accessToken: string; refreshToken: string; user: User } = await res.json();
        setAuthSession(data);
        toast({
          title: "Sesión restaurada",
          description: "Tu sesión fue recuperada correctamente",
        });
        router.push("/dashboard");
      } catch (error) {
        console.error("Error en refresh por cookie:", error);
        toast({
          variant: "destructive",
          title: "Autenticación fallida",
          description: "Intenta iniciar sesión nuevamente",
        });
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
          <div className="flex items-center gap-3 rounded-md border px-4 py-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" aria-hidden />
            <p aria-live="polite">Autenticando, por favor espera...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}