import React from "react";

// Este layout centrará los formularios de Login y Registro
// Duplicado en /app para compatibilidad con la ruta solicitada.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950">
      {children}
    </div>
  );
}