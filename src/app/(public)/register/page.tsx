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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
    defaultValues: { email: "", fullName: "", password: "", birthDate: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const payload = {
        email: values.email,
        fullName: values.fullName,
        password: values.password,
        birthDate: values.birthDate,
      };

      const response = await http<KycResponse>("/registro/creadora", {
        method: "POST",
        body: JSON.stringify({
          fullName: payload.fullName,
          email: payload.email,
          password: payload.password,
          birthDate: payload.birthDate,
        }),
      });
      toast({ variant: "info", title: "Registro iniciado", description: response?.message || "Verificación pendiente" });
      router.push("/login");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al registrar";
      const isEmailTaken = /409|EMAIL_TAKEN|ya registrado/i.test(message);
      toast({ variant: isEmailTaken ? "warning" : "destructive", title: isEmailTaken ? "Email ya registrado" : "Registro fallido", description: message });
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