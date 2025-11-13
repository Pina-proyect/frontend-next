import React from "react";

// Este layout centrará los formularios de Login y Registro
// Se ubica en el grupo de rutas (auth) para compartir estilos entre /login y /register
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
      {children}
    </div>
  );
}