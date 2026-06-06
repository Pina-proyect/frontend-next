"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { http } from "@/lib/http-client";
import { setAuthSession, type User } from "@/store/use-auth-store";
import { useToast } from "@/components/ui/use-toast";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const disableCookieRefresh = process.env.NEXT_PUBLIC_DISABLE_REFRESH === "true";

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    const proceedWithTokens = async (access: string, refresh: string) => {
      try {
        const api = process.env.NEXT_PUBLIC_API_URL || "/api/pina";
        const res = await fetch(`${api}/auth/me`, {
          headers: { Authorization: `Bearer ${access}` },
        });
        if (!res.ok) {
          const text = await res.text().catch(() => res.statusText);
          throw new Error(`HTTP ${res.status}: ${text.substring(0, 200)}`);
        }
        const user: User = await res.json();
        setAuthSession({ accessToken: access, refreshToken: refresh, user });
        toast({ title: "Autenticación exitosa", description: "Has iniciado sesión correctamente" });
        const hasSlug = !!user?.slug?.trim();
        router.push(hasSlug ? "/dashboard" : "/onboarding");
      } catch (error) {
        console.error("❌ Error en /auth/me:", error);
        const detail = error instanceof Error
          ? error.message.substring(0, 200)
          : "UNKNOWN";
        router.push(`/login?error=fetch_user_failed&detail=${encodeURIComponent(detail)}`);
      }
    };

    const tryCookieRefresh = async () => {
      if (disableCookieRefresh) {
        toast({ variant: "destructive", title: "Sesión no disponible", description: "Backend no disponible. Inicia sesión cuando esté activo." });
        router.push("/login");
        return;
      }
      try {
        const api = process.env.NEXT_PUBLIC_API_URL || "/api/pina";
        const res = await fetch(`${api}/auth/refresh`, { method: "POST", credentials: "include" });
        if (!res.ok) {
          toast({ variant: "destructive", title: "Autenticación fallida", description: "No fue posible restaurar la sesión" });
          router.push("/login?error=auth_failed");
          return;
        }
        const data: { accessToken: string; refreshToken: string; user: User } = await res.json();
        setAuthSession(data);
        toast({ title: "Sesión restaurada", description: "Tu sesión fue recuperada correctamente" });
        const me = await http<User>("/auth/me");
        const hasSlug = !!me?.slug?.trim();
        router.push(hasSlug ? "/dashboard" : "/onboarding");
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
  }, [searchParams, router, toast, disableCookieRefresh]);

  return null;
}

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
