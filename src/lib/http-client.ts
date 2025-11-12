// Cliente HTTP con soporte de refresh-token integrado.
// Uso previsto: llamadas desde componentes cliente en Next.js.
// Requiere NEXT_PUBLIC_API_URL en .env.local.

import {
  getAuthToken,
  getRefreshToken,
  setAuthSession,
  clearAuthSession,
  User,
} from "@/store/use-auth-store";

// Usar ruta relativa por defecto para aprovechar rewrites y cookies HttpOnly
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/pina";

type HttpOptions = RequestInit & {
  isRetry?: boolean;
};

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export async function http<T>(path: string, options: HttpOptions = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers);

  // Solo establecemos JSON si no es FormData
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  // Agregar Authorization si hay token y no es un reintento manual
  if (token && !options.isRetry) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    // 401: token expirado → intentamos refresh una sola vez
    if (response.status === 401 && !options.isRetry) {
      const refreshed = await handleRefreshToken();
      if (refreshed) {
        const retryHeaders = new Headers(options.headers);
        retryHeaders.set("Authorization", `Bearer ${refreshed.accessToken}`);
        return http<T>(path, { ...options, headers: retryHeaders, isRetry: true });
      }
      // Refresh falló: limpiamos sesión y redirigimos a login
      clearAuthSession();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new Error("Sesión expirada");
    }

    // Otros errores
    const errorBody = await response.text().catch(() => response.statusText);
    try {
      const errorJson = JSON.parse(errorBody);
      throw new Error(errorJson.message || `HTTP ${response.status}`);
    } catch {
      throw new Error(errorBody || `HTTP ${response.status}`);
    }
  }

  if (response.status === 204) {
    // Sin contenido
    return null as T;
  }
  return (await response.json()) as T;
}

async function handleRefreshToken(): Promise<{ accessToken: string } | null> {
  const refreshToken = getRefreshToken();
  try {
    // Si hay refreshToken en el store, lo enviamos en el body.
    // Si no, intentamos refresh basado en cookie HttpOnly con credentials: 'include'.
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
  } catch (e) {
    return null;
  }
}