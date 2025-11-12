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

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    const proceedWithTokens = async (access: string, refresh: string) => {
      try {
        const user = await http<User>("/auth/me", {
          headers: { Authorization: `Bearer ${access}` },
        });
        setAuthSession({ accessToken: access, refreshToken: refresh, user });
        toast({ title: "Autenticación exitosa", description: "Has iniciado sesión correctamente" });
        router.push("/dashboard");
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        toast({ variant: "destructive", title: "Error al cargar tu perfil", description: "No se pudo obtener tus datos" });
        router.push("/login?error=fetch_user_failed");
      }
    };

    const tryCookieRefresh = async () => {
      try {
        const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/pina";
        const res = await fetch(`${api}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) {
          toast({ variant: "destructive", title: "Autenticación fallida", description: "No fue posible restaurar la sesión" });
          router.push("/login?error=auth_failed");
          return;
        }
        const data: { accessToken: string; refreshToken: string; user: User } = await res.json();
        setAuthSession(data);
        toast({ title: "Sesión restaurada", description: "Tu sesión fue recuperada correctamente" });
        router.push("/dashboard");
      } catch (error) {
        console.error("Error en refresh por cookie:", error);
        toast({ variant: "destructive", title: "Autenticación fallida", description: "Intenta iniciar sesión nuevamente" });
        router.push("/login?error=auth_failed");
      }
    };

    if (accessToken && refreshToken) {
      proceedWithTokens(accessToken, refreshToken);
    } else if (accessToken && !refreshToken) {
      tryCookieRefresh();
    } else {
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