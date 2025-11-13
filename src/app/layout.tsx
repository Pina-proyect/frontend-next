import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"; // Importar el Toaster para notificaciones

// Configuración de la tipografía Inter
const inter = Inter({ subsets: ["latin"] });

// Metadatos del proyecto
export const metadata: Metadata = {
  title: "Proyecto Pina",
  description: "Plataforma de Creadoras",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Toaster /> {/* Añadir el Toaster aquí para notificaciones */}
      </body>
    </html>
  );
}
