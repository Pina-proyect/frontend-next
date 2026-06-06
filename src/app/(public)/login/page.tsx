"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
import { useToast } from "@/components/ui/use-toast"

import { http } from "@/lib/http-client"
import { setAuthSession, type User } from "@/store/use-auth-store"

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
})

interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [emailNotVerified, setEmailNotVerified] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const detail = params.get("detail");
    if (error === "fetch_user_failed" && detail) {
      console.error("🔍 Google callback error detail:", detail);
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: `Código: ${detail}`,
      });
    }
  }, [toast])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  })

  const handleResendVerification = async (email: string) => {
    try {
      await http("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      })
      toast({ title: "Email reenviado", description: "Revisa tu bandeja de entrada." })
      setEmailNotVerified(null)
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo reenviar el email." })
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await http<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      })
      setAuthSession(response)
      const me = await http<User>("/auth/me")
      
      if (me?.role === "CONSUMER") {
        router.push("/explore")
      } else {
        const hasSlug = !!me?.slug?.trim()
        router.push(hasSlug ? "/dashboard" : "/onboarding")
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : ""
      if (message === "EMAIL_NOT_VERIFIED") {
        setEmailNotVerified(values.email)
      } else {
        toast({
          variant: "destructive",
          title: "Error al iniciar sesión",
          description: message || "Credenciales incorrectas",
        })
      }
    }
  }

  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "/api/pina"
    window.location.href = `${backendUrl}/auth/google`
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
              <header className="mb-8">
                <h1 className="font-headline font-bold text-2xl tracking-tight text-on-surface mb-1">Bienvenido de vuelta</h1>
                <p className="text-on-surface-variant font-label text-sm">Por favor, ingresa tus datos para iniciar sesión.</p>
              </header>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="block font-label text-[11px] font-semibold text-on-surface-variant tracking-wider uppercase ml-1">
                          Correo Electrónico
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input placeholder="name@domain.com" type="email" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <FormLabel className="block font-label text-[11px] font-semibold text-on-surface-variant tracking-wider uppercase">
                            Contraseña
                          </FormLabel>
                          <Link href="#" className="font-label text-[11px] font-medium text-primary hover:text-primary-container transition-colors">
                            ¿Olvidaste tu contraseña?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input placeholder="••••••••" type="password" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email not verified alert */}
                  {emailNotVerified && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      <p className="font-semibold mb-1">Email no verificado</p>
                      <p className="mb-3">Debes verificar tu email antes de iniciar sesión.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleResendVerification(emailNotVerified)}
                      >
                        Reenviar email de verificación
                      </Button>
                    </div>
                  )}

                  {/* Primary CTA */}
                  <Button type="submit" className="w-full shadow-[0_12px_32px_-4px_rgba(67,82,165,0.2)]" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Iniciando Sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </Form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant/20"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-label tracking-widest text-on-surface-variant/40">
                  <span className="bg-surface/80 backdrop-blur-md px-4">O continúa con</span>
                </div>
              </div>

              {/* Social Logins */}
              <div className="flex flex-col gap-4">
                <Button type="button" variant="outline" className="group" onClick={handleGoogleLogin}>
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span className="font-headline font-semibold text-xs text-on-surface">Continuar con Google</span>
                </Button>
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-4">
              <p className="font-label text-sm text-on-surface-variant">
                  ¿No tienes una cuenta? 
                  <Link href="/register" className="font-bold text-primary ml-1 hover:underline underline-offset-4 decoration-primary/30">
                    Crear Cuenta
                  </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Decorative Image (hidden on mobile) */}
        <div className="hidden lg:flex w-1/2 relative bg-surface-container-low/50 border-l border-outline-variant/10 overflow-hidden items-center justify-center p-12">
           <div className="w-[85%] h-[85%] relative bg-surface-container-low rounded-[40px] rotate-[5deg] shadow-2xl flex items-center justify-center border border-white/50 backdrop-blur-sm z-10 overflow-hidden">
             {/* Note: I kept the original image source from code.html. */}
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
      
      {/* Material Symbols Import for the palette icon */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0');
      `}} />
    </main>
  )
}
