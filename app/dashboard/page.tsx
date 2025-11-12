"use client";

// Página de Dashboard básica para verificar la sesión contra /auth/me
// y mostrar datos del usuario. Usa Shadcn/UI y el http-client común.

import { useEffect, useState } from "react";
import { http } from "@/lib/http-client";
import { useAuthStore, setAuthSession, clearAuthSession, type User } from "@/store/use-auth-store";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  // Estado local para la verificación
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);

  // Tomamos el usuario y tokens del store para mostrar inmediatamente si existe
  const storedUser = useAuthStore((s) => s.user);
  const storedAccess = useAuthStore((s) => s.accessToken);
  const storedRefresh = useAuthStore((s) => s.refreshToken);

  useEffect(() => {
    let mounted = true;
    const verify = async () => {
      try {
        // Llamada protegida al backend para verificar sesión
        const me = await http<User>("/auth/me");
        if (!mounted) return;
        setProfile(me);
        // Actualiza el usuario del store con la info más reciente
        if (storedAccess && storedRefresh) {
          setAuthSession({ accessToken: storedAccess, refreshToken: storedRefresh, user: me });
        }
        toast({ title: "Sesión verificada", description: "Perfil cargado correctamente" });
      } catch (error: any) {
        console.error("Verificación de sesión fallida:", error);
        toast({ variant: "destructive", title: "Sesión inválida", description: "Inicia sesión nuevamente" });
        router.replace("/login?error=auth_failed");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    verify();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    toast({ title: "Sesión cerrada", description: "Has salido correctamente" });
    router.replace("/login");
  };

  const handleRefresh = async () => {
    try {
      // Intento de refresh vía cookie HttpOnly usando rutas relativas y rewrites
      const api = process.env.NEXT_PUBLIC_API_URL || "/api/pina";
      const res = await fetch(`${api}/auth/refresh`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Refresh fallido");
      const data: { accessToken: string; refreshToken: string; user: User } = await res.json();
      setAuthSession(data);
      setProfile(data.user);
      toast({ title: "Sesión actualizada", description: "Tokens y perfil renovados" });
    } catch (error) {
      toast({ variant: "destructive", title: "No se pudo refrescar", description: "Inicia sesión nuevamente" });
      router.replace("/login?error=auth_failed");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex items-center gap-3 rounded-md border px-4 py-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" aria-hidden />
          <p aria-live="polite">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  const userToShow = profile || storedUser;

  return (
    <div className="mx-auto max-w-xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Verificación de sesión y perfil</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userToShow ? (
            <div className="space-y-2">
              <p><span className="font-medium">Nombre:</span> {userToShow.fullName}</p>
              <p><span className="font-medium">Email:</span> {userToShow.email}</p>
              <p><span className="font-medium">Proveedor:</span> {userToShow.provider}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay usuario en sesión</p>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleRefresh}>Refrescar sesión</Button>
            <Button variant="destructive" onClick={handleLogout}>Cerrar sesión</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}