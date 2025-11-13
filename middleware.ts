// Middleware de Next.js para proteger rutas sensibles usando cookies HttpOnly.
// Propósito: bloquear acceso a `/dashboard` si no hay sesión válida.
// Estrategia:
// - Verificamos presencia de cookies de sesión (p. ej. `refreshToken` o `accessToken`).
// - Si no existen, redirigimos a `/login` pasando `next` para retorno post-login.
// - No inspeccionamos el contenido del token (por seguridad y simplicidad en frontend).

import { NextRequest, NextResponse } from "next/server";

// Middleware de Seguridad
// Ahora protegemos TODAS las rutas no públicas (grupo (app) y cualquier otra privada),
// dejando explícitamente accesibles las rutas públicas.

// 1) Definimos las rutas públicas explícitas
const PUBLIC_MATCHERS = [
  "/",
  "/login",
  "/register",
  "/auth/callback",
  "/api/pina/auth/google", // Inicio de OAuth debe ser público
  // Futuro: perfiles públicos, ej. '/[username]' → requerirá lógica de matching
];

// 2) Lógica: permitir públicas; proteger el resto
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ¿La ruta actual es pública? Igualdad exacta por ahora.
  const isPublic = PUBLIC_MATCHERS.some((prefix) => pathname === prefix);
  if (isPublic) {
    return NextResponse.next();
  }

  // 3) Protección: verificamos cookies típicas de sesión
  // Nota: el backend Nest debe establecer 'refreshToken' como HttpOnly.
  const hasRefresh = req.cookies.has("refreshToken") || req.cookies.has("refresh_token");
  const hasAccess = req.cookies.has("accessToken");

  if (hasRefresh || hasAccess) {
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