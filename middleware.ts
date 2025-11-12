// Middleware de Next.js para proteger rutas sensibles usando cookies HttpOnly.
// Propósito: bloquear acceso a `/dashboard` si no hay sesión válida.
// Estrategia:
// - Verificamos presencia de cookies de sesión (p. ej. `refreshToken` o `accessToken`).
// - Si no existen, redirigimos a `/login` pasando `next` para retorno post-login.
// - No inspeccionamos el contenido del token (por seguridad y simplicidad en frontend).

import { NextRequest, NextResponse } from "next/server";

// Rutas protegidas (puedes extender esta lista cuando agregues más secciones privadas)
const PROTECTED_MATCHERS = ["/dashboard"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ¿La ruta actual está en la lista de protegidas?
  const isProtected = PROTECTED_MATCHERS.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) return NextResponse.next();

  // Revisamos cookies típicas de sesión (nombres comunes).
  // NOTA: El backend Nest debería establecer `refreshToken` como HttpOnly.
  const hasRefresh = req.cookies.has("refreshToken") || req.cookies.has("refresh_token");
  const hasAccess = req.cookies.has("accessToken");

  if (hasRefresh || hasAccess) {
    // Hay señal de sesión → permitir acceso.
    return NextResponse.next();
  }

  // Sin cookies de sesión → redirigir a login con el `next` para volver luego.
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("error", "auth_required");
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

// Matcher para aplicar el middleware únicamente en rutas protegidas.
export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};