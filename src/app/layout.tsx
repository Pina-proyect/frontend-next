import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import MpProvider from "@/lib/mp-provider";

// Configuración de tipografías
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: 'swap' });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: 'swap' });

export const metadata: Metadata = {
  title: "Pina - El Estudio Digital",
  description: "Plataforma de Creadoras",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="light" suppressHydrationWarning>
      <body 
        className={`${inter.variable} ${manrope.variable} font-body bg-surface text-on-surface selection:bg-primary-fixed antialiased`}
        suppressHydrationWarning
      >
        <MpProvider>
          {children}
          <Toaster />
        </MpProvider>
      </body>
    </html>
  );
}
