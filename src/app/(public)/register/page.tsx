"use client";

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

import { http } from "@/lib/http-client";

const formSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.string().email({ message: "Email inválido" })),
  fullName: z.string().min(2, { message: "Nombre demasiado corto" }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .refine((val) => /[A-Z]/.test(val), { message: "Incluye al menos una letra mayúscula" })
    .refine((val) => /[a-z]/.test(val), { message: "Incluye al menos una letra minúscula" })
    .refine((val) => /[0-9]/.test(val), { message: "Incluye al menos un número" }),
  birthDate: z.string().refine((val) => {
    if (!val) return false;
    const date = new Date(val);
    if (isNaN(date.getTime())) return false;
    const now = new Date();
    const age = now.getFullYear() - date.getFullYear();
    const hasBirthdayPassed =
      now.getMonth() > date.getMonth() ||
      (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());
    const realAge = hasBirthdayPassed ? age : age - 1;
    return realAge >= 18;
  }, { message: "Debes ser mayor de 18 años" }),
  role: z.enum(["CREATOR", "CONSUMER"]),
});

interface KycResponse {
  status: "pending" | "verified" | "rejected";
  message: string;
  userId: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", fullName: "", password: "", birthDate: "", role: "CONSUMER" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const payload = {
        email: values.email,
        fullName: values.fullName,
        password: values.password,
        birthDate: values.birthDate,
        role: values.role,
      };

      const response = await http<KycResponse>("/registro/creadora", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast({ variant: "info", title: "Registro iniciado", description: response?.message || "Verificación pendiente" });
      router.push("/login");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al registrar";
      const isEmailTaken = /409|EMAIL_TAKEN|ya registrado/i.test(message);
      toast({ variant: isEmailTaken ? "warning" : "destructive", title: isEmailTaken ? "Email ya registrado" : "Registro fallido", description: message });
    }
  }

  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "/api/pina";
    window.location.href = `${backendUrl}/auth/google`;
  };

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
          <div className="w-full max-w-[480px]">
            {/* Brand Logo Anchor */}
            <div className="flex flex-col items-center mb-10">
              <span className="font-headline font-extrabold text-4xl tracking-tighter text-on-surface mb-2">Pina</span>
              <span className="text-on-surface-variant/60 font-label tracking-widest text-[10px] uppercase">El Estudio Digital</span>
            </div>

            {/* Glassmorphism Card */}
            <div className="glass-panel rounded-[12px] p-8 sm:p-10 shadow-[0_12px_32px_-4px_rgba(67,82,165,0.06)] ring-1 ring-outline-variant/15">
              <header className="mb-8">
                <h1 className="font-headline font-bold text-2xl tracking-tight text-on-surface mb-1">Únete a nosotros</h1>
                <p className="text-on-surface-variant font-label text-sm">Ingresa tus datos para solicitar acceso al ecosistema.</p>
              </header>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  {/* Role Selection */}
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-3 mb-6">
                        <FormLabel className="block font-label text-[11px] font-semibold text-on-surface-variant tracking-wider uppercase text-center mb-2">
                          ¿Qué quieres hacer en Pina?
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => field.onChange("CONSUMER")}
                              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                                field.value === "CONSUMER" 
                                  ? "border-primary bg-primary/5 text-primary shadow-sm" 
                                  : "border-outline-variant/30 text-on-surface-variant hover:border-primary/30"
                              }`}
                            >
                              <span className="material-symbols-outlined text-3xl mb-2" style={field.value === "CONSUMER" ? {fontVariationSettings: "'FILL' 1"} : {}}>favorite</span>
                              <span className="font-headline font-bold text-sm">Apoyar Creador/a</span>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => field.onChange("CREATOR")}
                              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                                field.value === "CREATOR" 
                                  ? "border-primary bg-primary/5 text-primary shadow-sm" 
                                  : "border-outline-variant/30 text-on-surface-variant hover:border-primary/30"
                              }`}
                            >
                              <span className="material-symbols-outlined text-3xl mb-2" style={field.value === "CREATOR" ? {fontVariationSettings: "'FILL' 1"} : {}}>video_camera_front</span>
                              <span className="font-headline font-bold text-sm">Crear un Estudio</span>
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-[11px] text-center" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name Field */}
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="block font-label text-[11px] font-semibold text-on-surface-variant tracking-wider uppercase ml-1">
                            Nombre Completo
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Luna Deseo" type="text" {...field} />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />

                    {/* Birth Date Field */}
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="block font-label text-[11px] font-semibold text-on-surface-variant tracking-wider uppercase ml-1">
                            Fecha de Nac.
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage className="text-[11px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="block font-label text-[11px] font-semibold text-on-surface-variant tracking-wider uppercase ml-1">
                          Correo electrónico
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="tu@email.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="block font-label text-[11px] font-semibold text-on-surface-variant tracking-wider uppercase ml-1">
                          Contraseña
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="••••••••" type="password" {...field} />
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  {/* Primary CTA */}
                  <Button type="submit" className="w-full mt-2 shadow-[0_12px_32px_-4px_rgba(67,82,165,0.2)]" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Cargando..." : "Crear cuenta"}
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
              <div className="grid grid-cols-2 gap-4">
                <Button type="button" variant="outline" className="group" onClick={handleGoogleLogin}>
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span className="font-headline font-semibold text-xs text-on-surface">Google</span>
                </Button>
                <Button type="button" variant="outline" className="group">
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C4.24 16.83 3.65 11.23 6.34 8.74c1.34-1.25 2.92-1.37 3.89-.85.92.48 1.63.48 2.6 0 .93-.46 2.76-.72 4.15.68 3.33 2.03.88 7.82.07 11.71zM14.9 6.84c-.39-1.99 1.15-3.87 3.01-4.14.39 2.13-1.63 4.23-3.01 4.14z" fill="currentColor"></path>
                  </svg>
                  <span className="font-headline font-semibold text-xs text-on-surface">Apple</span>
                </Button>
              </div>
            </div>

            {/* Footer Links */}
            <div className="mt-8 text-center">
              <p className="font-label text-sm text-on-surface-variant">
                  ¿Ya tienes cuenta? 
                  <Link href="/login" className="font-bold text-primary ml-1 hover:underline underline-offset-4 decoration-primary/30">
                    Inicia sesión
                  </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right: Decorative Image (hidden on mobile) */}
        <div className="hidden lg:flex w-1/2 relative bg-surface-container-low/50 border-l border-outline-variant/10 overflow-hidden items-center justify-center p-12">
           <div className="w-[85%] h-[85%] relative bg-surface-container-low rounded-[40px] rotate-[5deg] shadow-2xl flex items-center justify-center border border-white/50 backdrop-blur-sm z-10 overflow-hidden">
             <img alt="Estudio minimalista" className="w-full h-full object-cover rounded-[30px]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5yV934hBdKSeLeMT3pV3Ogm3yMm4OZu4_0MibmNgVvwFQeU8izWF9uGaeLYn22p9NmDjPE0Fwcx6IEopS_hFXkDyOcVbM0m3u7-Rk3Fo67jqHCcA-Hw5WNBG79j5ZRepHZz0YFKIeJq3yulCndndpe8w8M_UQPSjBqFyiOAjGed24S2lDMGZQbG8lQ9rLR9oeAw1NpoUFLkK8px7gSNTHFHvKm_Wnvh5_f-EPAQwz180JDE717pu7o4Pm7qgsiM3OOkKARZSr1qDj"/>
           </div>
           
           <div className="absolute right-10 top-24 w-40 h-40 opacity-70 z-20">
             <div className="w-full h-full bg-surface-container-lowest rounded-full rotate-[15deg] shadow-xl flex items-center justify-center p-6 border border-outline-variant/20">
               <span className="material-symbols-outlined text-primary text-6xl" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
             </div>
           </div>
        </div>
      </div>
      
      {/* Font Injection for Material Symbols */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,1,0');
      `}} />
    </main>
  );
}