"use client";

// Página de Registro (Next.js App Router)
// Implementa un formulario simple con Email, FullName, Password y BirthDate
// usando React Hook Form + Zod y componentes Shadcn/UI.
// Notas:
// - Envía los datos al backend vía `/auth/register`.
// - Si el backend devuelve tokens de sesión, se inicia sesión automáticamente.
// - Si el backend solo devuelve el usuario creado, se muestra un toast y se redirige a `/login`.

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Shadcn/UI
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Toast (compatible con Sonner)
import { useToast } from "@/components/ui/use-toast";

// HTTP client y store de sesión
import { http } from "@/lib/http-client";
import { type User } from "@/store/use-auth-store";

// Esquema Zod para el formulario de registro.
// Se asegura:
// - Email normalizado (trim + toLowerCase) y válido.
// - FullName con longitud mínima.
// - Password con longitud y chequeos básicos.
// - BirthDate tipo fecha y mayor de 18 años.
const formSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.string().email({ message: "Email inválido" })),
  fullName: z.string().min(2, { message: "Nombre demasiado corto" }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Incluye al menos una letra mayúscula",
    })
    .refine((val) => /[a-z]/.test(val), {
      message: "Incluye al menos una letra minúscula",
    })
    .refine((val) => /[0-9]/.test(val), {
      message: "Incluye al menos un número",
    }),
  birthDate: z
    .string()
    .refine((val) => {
      // Aceptamos formato `YYYY-MM-DD` del `<input type="date" />`.
      // Validamos que sea una fecha y que el usuario sea mayor de 18 años.
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
});

// Tipos del posible DTO de respuesta del backend.
// Algunos backends devuelven sesión (tokens + usuario) al registrarse,
// otros solo devuelven el usuario creado.
// Respuesta del backend para registro con KYC
// Ver backend: src/modules/auth/interfaces/kyc-response.interface.ts
interface KycResponse {
  status: 'pending' | 'verified' | 'rejected';
  message: string;
  userId: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      birthDate: "",
    },
  });

  // Maneja el submit del formulario.
  // Ciberseguridad: nunca loguees contraseñas ni las guardes en el store.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Preparar payload adaptado al DTO del backend.
      // Si tu backend espera `name` en vez de `fullName`, ajusta aquí.
      const payload = {
        email: values.email,
        fullName: values.fullName,
        password: values.password,
        birthDate: values.birthDate, // formato YYYY-MM-DD
      };

      // Llamada al endpoint de registro.
      const response = await http<KycResponse>(
        "/registro/creadora",
        {
          method: "POST",
          // Adaptación de claves al DTO real del backend (CreateCreatorDto):
          // fullName, email, nationalId, birthDate, photoPath, selfiePath, password?
          // Como omitimos el flujo KYC en esta versión, enviamos placeholders
          // seguros para nacionalId/selfie/photo y dejamos que el backend
          // marque el estado como 'pending'.
          body: JSON.stringify({
            fullName: payload.fullName,
            email: payload.email,
            password: payload.password,
            birthDate: payload.birthDate, // YYYY-MM-DD
            nationalId: "PENDING-KYC", // placeholder; en producción se solicitará en paso KYC
            photoPath: "gcs://pending/photo", // placeholder; será URL de GCS/S3
            selfiePath: "gcs://pending/selfie", // placeholder; será URL de GCS/S3
          }),
        }
      );
      // Registro KYC iniciado: informamos estado y redirigimos a login.
      toast({
        variant: "info",
        title: "Registro iniciado",
        description: response?.message || "Verificación pendiente, te avisaremos al finalizar",
      });
      router.push("/login");
    } catch (error: any) {
      // Manejo de errores: mensajes claros para el usuario.
      const message = error?.message || "Error al registrar";
      const isEmailTaken = /409|EMAIL_TAKEN|ya registrado/i.test(message);
      toast({
        variant: isEmailTaken ? "warning" : "destructive",
        title: isEmailTaken ? "Email ya registrado" : "Registro fallido",
        description: message,
      });
    }
  }

  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader>
        <CardTitle>Crear cuenta</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="tu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Luna Deseo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Birth Date */}
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de nacimiento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Cargando..." : "Crear cuenta"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="underline">
            Inicia sesión
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}