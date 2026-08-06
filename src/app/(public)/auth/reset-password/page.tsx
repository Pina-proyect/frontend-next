"use client"

import { Suspense, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { http } from "@/lib/http-client"

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
      .refine((val) => /[A-Z]/.test(val), { message: "Incluye al menos una letra mayúscula" })
      .refine((val) => /[a-z]/.test(val), { message: "Incluye al menos una letra minúscula" })
      .refine((val) => /[0-9]/.test(val), { message: "Incluye al menos un número" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"form" | "success" | "error">("form")
  const [errorMessage, setErrorMessage] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!token) {
      setStatus("error")
      setErrorMessage("El enlace de recuperación no es válido o ha expirado.")
      return
    }

    try {
      await http("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password: values.password }),
      })
      setStatus("success")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "No se pudo restablecer la contraseña."
      setErrorMessage(message)
      setStatus("error")
    }
  }

  return (
    <main className="min-h-screen relative flex flex-col md:flex-row items-center justify-center overflow-hidden px-4 md:px-0">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-container/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-primary/10 blur-[100px] pointer-events-none"></div>

      {/* Background Signature Textures */}
      <div className="fixed top-0 right-0 w-[60%] h-full pointer-events-none opacity-[0.03]">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path className="text-primary" d="M0,0 C30,40 70,20 100,50 L100,100 L0,100 Z" fill="currentColor"></path>
        </svg>
      </div>

      <div className="flex w-full min-h-screen">
        {/* Left: Interactive Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-10 relative z-10">
          <div className="w-full max-w-[440px]">
            {/* Brand Logo Anchor */}
            <div className="flex flex-col items-center mb-10">
              <span className="font-headline font-extrabold text-4xl tracking-tighter text-on-surface mb-2">Pina</span>
              <span className="text-on-surface-variant/60 font-label tracking-widest text-[10px] uppercase">El Estudio Digital</span>
            </div>

            {/* Glassmorphism Card */}
            <div className="glass-panel rounded-xl p-8 sm:p-10 shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] ring-1 ring-outline-variant/15">
              {status === "success" && (
                <div className="text-center animate-in slide-in-from-bottom-4 duration-500">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                  </div>
                  <header className="mb-6">
                    <h1 className="font-headline font-bold text-2xl tracking-tight text-on-surface mb-2">Contraseña actualizada</h1>
                    <p className="text-on-surface-variant font-body text-sm">Ya podés iniciar sesión con tu nueva contraseña.</p>
                  </header>
                  <Button asChild className="w-full">
                    <Link href="/login">Ir a iniciar sesión</Link>
                  </Button>
                </div>
              )}

              {status === "error" && (
                <div className="text-center animate-in slide-in-from-bottom-4 duration-500">
                  <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4 text-error">
                    <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>error</span>
                  </div>
                  <header className="mb-6">
                    <h1 className="font-headline font-bold text-2xl tracking-tight text-on-surface mb-2">Enlace inválido o expirado</h1>
                    <p className="text-on-surface-variant font-body text-sm">{errorMessage || "El token no es válido o ha expirado. Solicitá un nuevo enlace."}</p>
                  </header>
                  <Button asChild className="w-full">
                    <Link href="/forgot-password">Solicitar nuevo enlace</Link>
                  </Button>
                </div>
              )}

              {status === "form" && (
                <>
                  <header className="mb-8">
                    <h1 className="font-headline font-bold text-2xl tracking-tight text-on-surface mb-1">Restablecer contraseña</h1>
                    <p className="text-on-surface-variant font-label text-sm">Elegí una contraseña segura para tu cuenta.</p>
                  </header>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="block font-label text-[11px] font-semibold text-on-surface-variant tracking-wider uppercase ml-1">
                              Nueva contraseña
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input placeholder="••••••••" type="password" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="block font-label text-[11px] font-semibold text-on-surface-variant tracking-wider uppercase ml-1">
                              Confirmar contraseña
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input placeholder="••••••••" type="password" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full shadow-[0_12px_32px_-4px_rgba(67,82,165,0.2)]" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Guardando..." : "Guardar contraseña"}
                      </Button>
                    </form>
                  </Form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Decorative Image (hidden on mobile) */}
        <div className="hidden lg:flex w-1/2 relative bg-surface-container-low/50 border-l border-outline-variant/10 overflow-hidden items-center justify-center p-12">
           <div className="w-[85%] h-[85%] relative bg-surface-container-low rounded-[40px] rotate-[5deg] shadow-2xl flex items-center justify-center border border-white/50 backdrop-blur-sm z-10 overflow-hidden">
             <img alt="Minimalist workspace" className="w-full h-full object-cover rounded-[30px]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5yV934hBdKSeLeMT3pV3Ogm3yMm4OZu4_0MibmNgVvwFQeU8izWF9uGaeLYn22p9NmDjPE0Fwcx6IEopS_hFXkDyOcVbM0m3u7-Rk3Fo67jqHCcA-Hw5WNBG79j5ZRepHZz0YFKIeJq3yulCndndpe8w8M_UQPSjBqFyiOAjGed24S2lDMGZQbG8lQ9rLR9oeAw1NpoUFLkK8px7gSNTHFHvKm_Wnvh5_f-EPAQwz180JDE717pu7o4Pm7qgsiM3OOkKARZSr1qDj"/>
           </div>

           {/* Floating palette icon */}
           <div className="absolute left-10 bottom-24 w-32 h-32 opacity-80 z-20">
             <div className="w-full h-full bg-surface-container-lowest rounded-full rotate-[-10deg] shadow-xl flex items-center justify-center p-6 border border-outline-variant/20">
               <span className="material-symbols-outlined text-primary text-5xl" style={{fontVariationSettings: "'FILL' 1"}}>palette</span>
             </div>
           </div>
        </div>
      </div>

      {/* Material Symbols Import */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0');
      `}} />
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
