"use client";

// Cliente HTTP con refresh-token
// Reemplaza al antiguo client.ts y agrega lógica de reintento segura.
// NOTA: Este módulo es de uso en componentes cliente (App Router).

import {
  getAuthToken,
  getRefreshToken,
  setAuthSession,
  clearAuthSession,
  User,
} from "@/store/use-auth-store";

// Asegúrate de definir esta variable en `.env.local`.
// Ejemplo en `.env.local.example`:
// Usar ruta relativa por defecto para aprovechar rewrites y cookies HttpOnly
// NEXT_PUBLIC_API_URL puede apuntar a '/api/pina' en desarrollo.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/pina";

// Opciones extendidas para evitar bucles de reintento
type HttpOptions = RequestInit & {
  isRetry?: boolean;
};

// Respuesta esperada del endpoint /auth/refresh
interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Función principal: realiza fetch y, ante 401, intenta refrescar el token una vez
export async function http<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);

  // Content-Type JSON si no estamos enviando FormData
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  // Agregar Authorization si existe token y no es reintento
  if (token && !options.isRetry) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    // Token expirado → intentamos refresh sólo una vez
    if (response.status === 401 && !options.isRetry) {
      const newTokens = await handleRefreshToken();
      if (newTokens) {
        // Reintentar la petición original con el nuevo token
        return http<T>(path, {
          ...options,
          headers: { ...Object.fromEntries(headers.entries()), Authorization: `Bearer ${newTokens.accessToken}` },
          isRetry: true,
        });
      } else {
        // Si el refresh falla, limpiamos sesión y redirigimos a login
        clearAuthSession();
        window.location.href = "/login";
        throw new Error("Sesión expirada");
      }
    }

    // Otros errores: intentamos parsear JSON o devolvemos texto plano
    const errorBody = await response.text().catch(() => response.statusText);
    try {
      const errorJson = JSON.parse(errorBody);
      throw new Error(errorJson.message || `HTTP ${response.status}`);
    } catch {
      throw new Error(errorBody || `HTTP ${response.status}`);
    }
  }

  if (response.status === 204) {
    // No Content
    return null as T;
  }
  return response.json() as Promise<T>;
}

// Lógica para refrescar el token: usa refreshToken del store y actualiza sesión
async function handleRefreshToken(): Promise<{ accessToken: string } | null> {
  const refreshToken = getRefreshToken();
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: refreshToken ? { "Content-Type": "application/json" } : undefined,
      body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
      credentials: "include",
    });

    if (!response.ok) throw new Error("Refresh token failed");

    const data: RefreshResponse = await response.json();
    setAuthSession(data);
    return { accessToken: data.accessToken };
  } catch (error) {
    console.error("Failed to refresh token:", error);
    return null;
  }
}