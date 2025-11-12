"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Componentes Shadcn/UI (Ya deben estar instalados)
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

// Lógica de Negocio
import { http } from "@/lib/http-client"
import { setAuthSession, type User } from "@/store/use-auth-store"

// Esquema de validación con Zod
const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
})

// Tipos del DTO de respuesta del Backend
interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await http<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      })
      setAuthSession(response)
      router.push("/dashboard") // Redirigir
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: error?.message || "Credenciales incorrectas",
      })
    }
  }

  const handleGoogleLogin = () => {
    // Redirige al endpoint del backend que inicia el flujo OAuth
    // Usar ruta relativa para aprovechar rewrites y cookies HttpOnly en dev.
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "/api/pina"
    window.location.href = `${backendUrl}/auth/google`
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa tus credenciales o usa un proveedor</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* BOTÓN DE GOOGLE */}
        <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
          {/* Aquí iría el SVG de Google */}
          Iniciar sesión con Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">O continúa con</span>
          </div>
        </div>

        {/* FORMULARIO CONVENCIONAL */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="creadora@pina.com" {...field} />
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
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Cargando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="underline">
            Regístrate
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}