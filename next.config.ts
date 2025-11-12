import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Rewrites para proxy de API al backend Nest en desarrollo.
   * Esto ayuda a evitar problemas de CORS y habilita cookies HttpOnly
   * usando rutas relativas (NEXT_PUBLIC_API_URL=/api/pina).
   */
  async rewrites() {
    return [
      {
        source: "/api/pina/:path*",
        destination:
          process.env.BACKEND_URL?.replace(/\/$/, "") + "/api/pina/:path*" ||
          "http://localhost:3000/api/pina/:path*",
      },
    ];
  },
};

export default nextConfig;
