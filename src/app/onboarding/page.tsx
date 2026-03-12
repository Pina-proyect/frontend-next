"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

import { http } from "@/lib/http-client";
import { getAuthToken, type User } from "@/store/use-auth-store";

const formSchema = z.object({
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres")
    .max(30, "El slug no puede exceder 30 caracteres")
    .regex(/^[a-zA-Z0-9-]+$/, "El slug solo puede contener letras, números y guiones")
    .transform((val) => val.toLowerCase()),
  bio: z
    .string()
    .max(255, "La biografía no puede exceder 255 caracteres")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "",
      bio: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast({
          variant: "destructive",
          title: "Error de autenticación",
          description: "No estás autenticado. Por favor, inicia sesión nuevamente.",
        });
        router.push("/login");
        return;
      }

      await http<User>("/auth/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      toast({
        title: "¡Perfil actualizado!",
        description: "Tu perfil ha sido creado exitosamente.",
      });

      // Redirigir al dashboard con el nuevo slug
      router.push(`/dashboard`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error al actualizar el perfil";
      
      if (message.includes("ya está en uso")) {
        form.setError("slug", {
          type: "manual",
          message: "Este slug ya está en uso. Por favor, elige otro.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error al actualizar el perfil",
          description: message,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Completa tu perfil</CardTitle>
          <CardDescription>
            Crea tu URL única y cuéntanos un poco sobre ti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de perfil</FormLabel>
                    <div className="flex">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                        pina.app/
                      </span>
                      <FormControl>
                        <Input
                          placeholder="tu-nombre"
                          className="rounded-l-none"
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografía (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Cuéntanos sobre ti, tus intereses o lo que te apasiona..."
                        className="min-h-[100px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Guardando...
                  </>
                ) : (
                  "Completar perfil"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}