"use client"

// Hook de compatibilidad con la API de shadcn "useToast"
// Mapea a Sonner internamente para permitir llamadas como
// toast({ variant: "destructive", title, description })
import { toast as sonnerToast } from "sonner"

type ToastVariant = "default" | "destructive" | "success" | "warning" | "info"

interface ShadcnToastProps {
  title?: string
  description?: string
  variant?: ToastVariant
}

export function useToast() {
  return {
    toast: ({ title, description, variant = "default" }: ShadcnToastProps) => {
      switch (variant) {
        case "destructive":
          sonnerToast.error(title ?? "Error", { description })
          break
        case "success":
          sonnerToast.success(title ?? "Éxito", { description })
          break
        case "warning":
          sonnerToast.warning?.(title ?? "Atención", { description })
          // Si la versión de Sonner no soporta warning, usar toast
          if (!sonnerToast.warning) sonnerToast(title ?? "Atención", { description })
          break
        case "info":
          sonnerToast.info?.(title ?? "Info", { description })
          if (!sonnerToast.info) sonnerToast(title ?? "Info", { description })
          break
        default:
          sonnerToast(title ?? "", { description })
      }
    },
  }
}