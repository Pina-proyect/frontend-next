import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css"; // Importar estilos globales desde src/app
import { Toaster } from "@/components/ui/toaster"; // Importar el Toaster

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Proyecto Pina",
  description: "Plataforma de Creadoras",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
        <Toaster /> {/* Añadir el Toaster al final del body */}
      </body>
    </html>
  );
}