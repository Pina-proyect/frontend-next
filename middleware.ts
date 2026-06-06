// Middleware de Next.js para proteger rutas sensibles usando cookies HttpOnly.
// Propósito: bloquear acceso a `/dashboard`, `/onboarding` y otras áreas privadas si no hay sesión.

import { NextRequest, NextResponse } from "next/server";

// 1) Definimos los prefijos de rutas que requieren autenticación de forma mandatoria.
const PRIVATE_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/settings",
  "/packs",
  "/content",
  "/payment-status",
];

// 2) Lógica: proteger solo las rutas privadas; permitir acceso libre a todo lo demás
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ¿La ruta actual requiere autenticación?
  const isPrivate = PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  // Si no es una ruta privada, permitimos el paso libre (p. ej., landing, /explore, /[slug], y APIs)
  if (!isPrivate) {
    return NextResponse.next();
  }

  // 3) Protección: verificamos cookies típicas de sesión
  //    auth_session es una cookie no-HttpOnly seteada por el callback page
  //    (necesaria porque las cookies HttpOnly del backend están en otro dominio)
  const hasAuthSession = req.cookies.has("auth_session");
  const hasRefresh = req.cookies.has("refreshToken") || req.cookies.has("refresh_token");
  const hasAccess = req.cookies.has("accessToken");

  if (hasAuthSession || hasRefresh || hasAccess) {
    // Hay sesión → permitir acceso a rutas privadas
    return NextResponse.next();
  }

  // No hay sesión → redirigir a login con next para volver post-login
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("error", "auth_required");
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

// 4) Configuración del matcher: aplica a todas las rutas salvo estáticos e imágenes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};