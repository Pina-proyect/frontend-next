"use client"

// Reexport del Toaster desde el wrapper de Shadcn/Sonner
// Esto permite mantener el import solicitado como "@/components/ui/toaster"
// y centralizar la implementación real en "sonner.tsx".
export { Toaster } from "./sonner"