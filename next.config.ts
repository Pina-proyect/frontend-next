import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Rewrites para proxy de API al backend Nest en desarrollo.
   * Esto ayuda a evitar problemas de CORS y habilita cookies HttpOnly
   * usando rutas relativas (NEXT_PUBLIC_API_URL=/api/pina).
   */
  async rewrites() {
    // Importante: si BACKEND_URL no está definido, el uso de concatenación
    // puede producir "undefined/..." y romper la configuración.
    // Usamos un fallback seguro y explícito.
    const backend = process.env.BACKEND_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
    return [
      {
        source: "/api/pina/:path*",
        destination: `${backend}/api/pina/:path*`,
      },
      // Alias adicional: algunas configuraciones antiguas usan '/pina' sin el prefijo '/api'.
      // Este rewrite asegura compatibilidad y evita 404 como 'Cannot GET /pina/...'.
      {
        source: "/pina/:path*",
        destination: `${backend}/api/pina/:path*`,
      },
    ];
  },
};

export default nextConfig;
