import type { Config } from "tailwindcss";

// Tailwind v4 uses CSS variables primarily using @theme, 
// so this file only extends plugins and adds compat content.
const config: Config = {
  darkMode: ["class", ".dark"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {},
  },
};

export default config;