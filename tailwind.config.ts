// Tailwind Config (Opcional para compatibilidad y DX)
// Nota: En Tailwind CSS v4, la personalización principal se realiza en CSS
// con `@theme inline`. Este archivo es útil para tooling del editor,
// autocompletado y compatibilidad con configuraciones clásicas.

import type { Config } from "tailwindcss";

const config: Config = {
  // Modo oscuro por clase, coherente con `.dark` usado en el proyecto
  darkMode: ["class", ".dark"],

  // En Tailwind v4, `content` ya no es necesario; se mantiene vacío por DX.
  // content: [],

  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Mapear colores a variables HSL definidas en `globals.css`
      // Esto habilita clases utilitarias como `bg-success`, `text-success-foreground`, etc.
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // Nuevo: colores de éxito (success)
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // Puedes extender aquí borderRadius, keyframes, animation, etc. si es necesario
    },
  },

  // En v4 las animaciones están gestionadas vía CSS; si usas tailwindcss-animate (v3),
  // asegúrate de tener la dependencia instalada antes de activarla aquí.
  // plugins: [require("tailwindcss-animate")],
};

export default config;